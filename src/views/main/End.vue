<template>
    <div class="end-container">
        <div class="credits-section">
            <h1 class="credits-title">Credits</h1>

            <div class="credits-grid">
                <div class="credit-item">
                    <h3 class="credit-name">Elias Heiner</h3>
                    <ul class="credit-tasks">
                        <li>Intro</li>
                        <li>Outros</li>
                    </ul>
                </div>

                <div class="credit-item">
                    <h3 class="credit-name">Eduard Eremenko</h3>
                    <ul class="credit-tasks">
                        <li>Stevie Animationen</li>
                        <li>Outro</li>
                    </ul>
                </div>

                <div class="credit-item">
                    <h3 class="credit-name">Lasse Keller</h3>
                    <ul class="credit-tasks">
                        <li>Knowledges erstellt</li>
                        <li>Spiel Tester</li>
                    </ul>
                </div>

                <div class="credit-item">
                    <h3 class="credit-name">Tobias Weiss</h3>
                    <ul class="credit-tasks">
                        <li>Informationen Tinder</li>
                        <li>Circuit Breaker</li>
                    </ul>
                </div>

                <div class="credit-item">
                    <h3 class="credit-name">Yuki Schäfer</h3>
                    <ul class="credit-tasks">
                        <li>Alles andere im Zusammenhang zum Spiel</li>
                    </ul>
                </div>
                <div class="music-section">
                    <h3 class="credit-name">Hintergrund-Musik</h3>
                    <a href="https://pixabay.com/music/crime-scene-dark-mysterious-true-crime-music-loopable-235870/"
                        class="music-link" target="_blank" rel="noopener noreferrer">
                        Dark Mysterious True Crime Music (Pixabay)
                    </a>
                </div>
                <div class="music-section">
                    <h3 class="credit-name">Finger Bilder</h3>
                    <a href="https://github.com/mike546378/GTAV-FingerprintSolver" class="music-link" target="_blank"
                        rel="noopener noreferrer">
                        GTAV-FingerprintSolver - mike546378
                    </a>
                </div>
            </div>



            <div class="button-section">
                <button @click="useKnowledgeStore().clearLocalstorage()" class="restart-button">
                    Zum Anfang
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useKnowledgeStore } from '@/stores/knowledge';

</script>

<style lang="css" scoped>
.end-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background);
    padding: 40px 20px;
}

.credits-section {
    max-width: 800px;
    width: 100%;
    background: var(--color-background-soft);
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-border);
}

.credits-title {
    font-family: 'Pixel', monospace;
    font-size: 2.5rem;
    color: var(--green);
    text-align: center;
    margin-bottom: 40px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.credits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}

.credit-item {
    background: var(--color-background-mute);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.credit-item:hover {
    transform: translateY(-2px);
    border-color: var(--green);
}

.credit-name {
    font-family: 'Pixel', monospace;
    font-size: 1.2rem;
    color: var(--green);
    margin: 0 0 12px 0;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 8px;
}

.credit-tasks {
    list-style: none;
    padding: 0;
    margin: 0;
}

.credit-tasks li {
    font-family: Inter, sans-serif;
    font-size: 0.95rem;
    color: var(--color-text);
    padding: 4px 0;
    padding-left: 16px;
    position: relative;
    line-height: 1.4;
}

.credit-tasks li::before {
    content: "•";
    color: var(--green);
    font-weight: bold;
    position: absolute;
    left: 0;
}

.music-section {
    background: var(--color-background-mute);
    padding: 24px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    text-align: center;
}

.music-title {
    font-family: 'Pixel', monospace;
    font-size: 1.2rem;
    color: var(--green);
    margin: 0 0 12px 0;
}

.music-link {
    font-family: Inter, sans-serif;
    color: var(--green);
    text-decoration: none;
    font-size: 0.95rem;
    padding: 8px 16px;
    border: 1px solid var(--green);
    border-radius: 6px;
    display: inline-block;
    transition: all 0.3s ease;
}

.music-link:hover {
    background: var(--green);
    color: var(--color-background);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.button-section {
    margin-top: 30px;
    text-align: center;
}

.restart-button {
    font-family: 'Pixel', monospace;
    font-size: 1.1rem;
    font-weight: bold;
    padding: 16px 32px;
    background-color: transparent;
    color: var(--green);
    border: 2px solid var(--green);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.restart-button:hover {
    background-color: var(--green);
    color: var(--color-background);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.restart-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
    .credits-section {
        padding: 24px;
    }

    .credits-title {
        font-size: 2rem;
    }

    .credits-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .credit-item {
        padding: 16px;
    }
}
</style>
