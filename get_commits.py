import subprocess
import json
import os
import shutil
import stat
import sys
from datetime import datetime
from collections import defaultdict
import re

# Configuration Variables
REPORT_FILENAME = 'bericht.md'
DEFAULT_FIRST_COMMIT_MINUTES = 70
DEFAULT_SUBSEQUENT_COMMIT_MINUTES = 45
MAX_TIME_BETWEEN_COMMITS_MINUTES = 60

def get_script_directory():
    return os.path.dirname(os.path.abspath(__file__))

def remove_readonly(func, path, _):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def cleanup_repo(repo_path):
    try:
        print(f"Cleaning up cloned repository: {repo_path}")
        shutil.rmtree(repo_path, onerror=remove_readonly)
    except Exception as e:
        print(f"Warning: Could not fully clean up repository: {e}")

def fetch_commits(repo_path):
    try:
        result = subprocess.run([
            'git', 'log', '--pretty=format:%H%x00%ai%x00%an%x00%s',
            '--all'
        ], cwd=repo_path, capture_output=True, text=False, check=True)

        raw_stdout = result.stdout
        commits = []
        
        raw_commit_records = raw_stdout.strip().split(b'\n')

        for raw_record_bytes in raw_commit_records:
            if not raw_record_bytes: 
                continue
            
            record_text = ''
            try:
               
                record_text = raw_record_bytes.decode('utf-8')
            except UnicodeDecodeError as ude:
               
                print(f"Warning: UnicodeDecodeError for raw record: {raw_record_bytes!r}. Error: {ude}. Attempting decode with errors='replace'.")
                record_text = raw_record_bytes.decode('utf-8', errors='replace')
            parts = record_text.split('\x00', 3)
            
            if len(parts) == 4:
                commit_hash, date_str, author_name, message_str = parts
                commit_dict = {
                    "hash": commit_hash,
                    "date": date_str,
                    "message": message_str,
                    "author": author_name
                }
                commits.append(commit_dict)
            else:
                print(f"Warning: Could not parse commit record. Expected 4 parts, got {len(parts)}. Decoded text: '{record_text}'. Raw bytes: {raw_record_bytes!r}")
        
        return commits
    except subprocess.CalledProcessError as e:
        stdout_decoded = e.stdout.decode('utf-8', errors='replace') if e.stdout else "(no stdout)"
        stderr_decoded = e.stderr.decode('utf-8', errors='replace') if e.stderr else "(no stderr)"
        print(f"Error fetching commits. Git command failed with exit code {e.returncode}.")
        print(f"Stdout: {stdout_decoded}")
        print(f"Stderr: {stderr_decoded}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred in fetch_commits: {e}")
       
        sys.exit(1)

def clone_repo(repo_url):
    script_dir = get_script_directory()
    repo_name = repo_url.split('/')[-1].replace('.git', '')
    repo_path = os.path.join(script_dir, repo_name)
    
    if os.path.exists(repo_path):
        cleanup_repo(repo_path)
    
    print(f"Cloning repository to: {repo_path}")
    subprocess.run(['git', 'clone', repo_url, repo_path], check=True)
    return repo_path

def group_commits_by_date(commits):
    grouped = {}
    for commit in commits:
        date_str = commit['date']
        
        if 'Z' in date_str:
            commit['datetime'] = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        elif re.match(r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4}', date_str):
            commit['datetime'] = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S %z')
        else:
            try:
                commit['datetime'] = datetime.fromisoformat(date_str)
            except ValueError:
                commit['datetime'] = datetime.now()
        
        formatted_date = commit['datetime'].strftime('%Y.%m.%d')
        
        if formatted_date not in grouped:
            grouped[formatted_date] = []
        grouped[formatted_date].append(commit)
    
    return grouped

def calculate_daily_time(commits):
    if len(commits) == 1:
        return DEFAULT_FIRST_COMMIT_MINUTES
    
    total_time = DEFAULT_FIRST_COMMIT_MINUTES
    
    for i in range(1, len(commits)):
        prev_commit = commits[i-1]
        curr_commit = commits[i]
        
        time_diff = abs((curr_commit['datetime'] - prev_commit['datetime']).total_seconds() / 60)
        
        if time_diff <= MAX_TIME_BETWEEN_COMMITS_MINUTES:
            total_time += time_diff
        else:
            total_time += DEFAULT_SUBSEQUENT_COMMIT_MINUTES
    
    return total_time

def format_hours(hours):
    if hours == 1.0:
        return f"{hours:.1f} Stunde"
    else:
        return f"{hours:.1f} Stunden"

def filter_commits_by_author(commits, author_filter):
    filtered_commits = []
    for commit in commits:
        if author_filter.lower() in commit['author'].lower():
            filtered_commits.append(commit)
    return filtered_commits

def write_commits_to_file(grouped_commits, filename=REPORT_FILENAME, author_filter=None):
    script_dir = get_script_directory()
    filepath = os.path.join(script_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("# Arbeitsbericht\n\n")
        
        if author_filter:
            f.write(f"*Gefiltert nach Autor: '{author_filter}'*\n\n")
        
        sorted_dates = sorted(grouped_commits.keys(), reverse=True)
        
        total_commits = 0
        total_time = 0
        
        for date in sorted_dates:
            commits = grouped_commits[date]
            commit_count = len(commits)
            estimated_time = calculate_daily_time(commits)
            
            total_commits += commit_count
            total_time += estimated_time
            
            hours = estimated_time / 60
            f.write(f'### {date}\n')
            f.write(f'**Commits:** {commit_count} | **Ungefähre Zeit:** {format_hours(hours)}\n\n')
            
            for commit in commits:
                time_str = commit['datetime'].strftime('%H:%M')
                f.write(f'- `{commit["hash"][:8]}` {time_str} - {commit["message"]}\n')
            
            f.write("\n")
        
        f.write('---\n\n')
        f.write(f'### Zusammenfassung\n')
        f.write(f'**Commits Gesamt:** {total_commits}\n')
        total_hours = total_time / 60
        f.write(f'**Ungefähre Zeit Gesamt:** {format_hours(total_hours)}\n')
    
    return filepath

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <repo_url_or_path>")
        sys.exit(1)
    
    repo_input = sys.argv[1]
    repo_path = None
    
    if repo_input.startswith('http'):
        repo_path = clone_repo(repo_input)
    else:
        repo_path = repo_input
    
    try:
        print("Fetching commits...")
        commits = fetch_commits(repo_path)
        
        print("Filtering commits for author containing 'yuki'...")
        commits = filter_commits_by_author(commits, "yuki")
        print(f"Found {len(commits)} commits from authors containing 'yuki'")
        
        print("Grouping commits by date...")
        grouped_commits = group_commits_by_date(commits)
        
        print("Writing report to file...")
        filepath = write_commits_to_file(grouped_commits, author_filter="yuki")
        print(f"Report written to {filepath}")
        print(f"Total commits processed: {sum(len(commits) for commits in grouped_commits.values())}")
        
    finally:
        if repo_input.startswith('http') and repo_path and os.path.exists(repo_path):
            cleanup_repo(repo_path)

if __name__ == "__main__":
    main()