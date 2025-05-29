<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { StevieStateType } from '../../stores/stevie'
import type { GameStateType } from '../../stores/game'
import { useStevieStore } from '../../stores/stevie'

const stevieStore = useStevieStore()
const jsonOutput = ref('')
const showCopiedMessage = ref(false)

interface IdeaMessage {
    message: string
    gameState: GameStateType
    stevieState: StevieStateType
    duration: number
}

interface MonologMessage {
    message: string
    duration: number
}

interface Monolog {
    title: string
    messages: MonologMessage[]
    stevieState: StevieStateType
}

interface StevieData {
    ideen: IdeaMessage[]
    monolog: Monolog[]
}

const stevieData = ref<StevieData>({
    ideen: [],
    monolog: [],
})

const newIdea = ref<IdeaMessage>({
    message: '',
    gameState: 'graph',
    stevieState: 'normal',
    duration: 3,
})

const newMonolog = ref<Monolog>({
    title: '',
    messages: [],
    stevieState: 'normal',
})

const newMonologMessage = ref<MonologMessage>({
    message: '',
    duration: 3,
})

const gameStates: GameStateType[] = [
    'intro',
    'graph',
    'circuitbreaker',
    'ceaser',
    'finger',
    'wire',
    'tinder',
]

const stevieStates: StevieStateType[] = ['normal', 'angry', 'happy', 'sad', 'confused', 'scared']
const selectedMonologIndex = ref<number>(-1)
const isEditingMonolog = ref(false)
const editingMonologIndex = ref<number>(-1)
const isEditingIdea = ref(false)
const editingIdeaIndex = ref<number>(-1)
const isEditingMessage = ref(false)
const editingMessageIndex = ref<number>(-1)

function addIdea() {
    if (newIdea.value.message.trim() !== '') {
        if (isEditingIdea.value && editingIdeaIndex.value >= 0) {
            stevieData.value.ideen[editingIdeaIndex.value] = { ...newIdea.value }
            isEditingIdea.value = false
            editingIdeaIndex.value = -1
        } else {            stevieData.value.ideen.push({ ...newIdea.value })
        }
        newIdea.value = {
            message: '',
            gameState: 'graph',
            stevieState: 'normal',
            duration: 3,
        }
        updateJsonOutput()
    }
}

function removeIdea(index: number) {
    stevieData.value.ideen.splice(index, 1)
    if (isEditingIdea.value && editingIdeaIndex.value === index) {
        isEditingIdea.value = false
        editingIdeaIndex.value = -1
        newIdea.value = {
            message: '',
            gameState: 'graph',
            stevieState: 'normal',
            duration: 3,
        }
    }
    updateJsonOutput()
}

function editIdea(index: number) {
    const idea = stevieData.value.ideen[index]
    newIdea.value = { ...idea }
    isEditingIdea.value = true
    editingIdeaIndex.value = index
}

function cancelEditIdea() {
    isEditingIdea.value = false
    editingIdeaIndex.value = -1
    newIdea.value = {
        message: '',
        gameState: 'graph',
        stevieState: 'normal',
        duration: 3,
    }
}

function editMonolog(index: number) {
    const monolog = stevieData.value.monolog[index]
    newMonolog.value = {
        title: monolog.title,
        stevieState: monolog.stevieState,
        messages: [],
    }
    isEditingMonolog.value = true
    editingMonologIndex.value = index
}

function updateMonolog() {
    if (isEditingMonolog.value && editingMonologIndex.value >= 0) {

        stevieData.value.monolog[editingMonologIndex.value].title = newMonolog.value.title
        stevieData.value.monolog[editingMonologIndex.value].stevieState = newMonolog.value.stevieState
        isEditingMonolog.value = false
        editingMonologIndex.value = -1
        newMonolog.value = {
            title: '',
            stevieState: 'normal',
            messages: [],
        }
        updateJsonOutput()
    }
}

function cancelEditMonolog() {
    isEditingMonolog.value = false
    editingMonologIndex.value = -1
    newMonolog.value = {
        title: '',
        stevieState: 'normal',
        messages: [],
    }
}

function addMonolog() {
    if (newMonolog.value.title.trim() !== '') {
        if (isEditingMonolog.value && editingMonologIndex.value >= 0) {
            updateMonolog()
        } else {
            stevieData.value.monolog.push({
                title: newMonolog.value.title,
                messages: [],
                stevieState: newMonolog.value.stevieState,
            })
            newMonolog.value.title = ''
            updateJsonOutput()
        }
    }
}

function removeMonolog(index: number) {
    stevieData.value.monolog.splice(index, 1)
    selectedMonologIndex.value = -1
    updateJsonOutput()
}

function selectMonolog(index: number) {
    selectedMonologIndex.value = index
}

function addMonologMessage() {
    if (selectedMonologIndex.value >= 0 && newMonologMessage.value.message.trim() !== '') {
        if (isEditingMessage.value && editingMessageIndex.value >= 0) {
            stevieData.value.monolog[selectedMonologIndex.value].messages[
                editingMessageIndex.value
            ] = { ...newMonologMessage.value }
            isEditingMessage.value = false
            editingMessageIndex.value = -1
        } else {

            stevieData.value.monolog[selectedMonologIndex.value].messages.push({
                ...newMonologMessage.value,
            })
        }

        newMonologMessage.value = {
            message: '',
            duration: 3,
        }
        updateJsonOutput()
    }
}

function editMonologMessage(messageIndex: number) {
    if (selectedMonologIndex.value >= 0) {
        const message = stevieData.value.monolog[selectedMonologIndex.value].messages[messageIndex]
        newMonologMessage.value = { ...message }
        isEditingMessage.value = true
        editingMessageIndex.value = messageIndex
    }
}

function cancelEditMonologMessage() {
    isEditingMessage.value = false
    editingMessageIndex.value = -1
    newMonologMessage.value = {
        message: '',
        duration: 3,
    }
}

function removeMonologMessage(messageIndex: number) {
    if (selectedMonologIndex.value >= 0) {
        stevieData.value.monolog[selectedMonologIndex.value].messages.splice(messageIndex, 1)

        if (isEditingMessage.value && editingMessageIndex.value === messageIndex) {
            isEditingMessage.value = false
            editingMessageIndex.value = -1
            newMonologMessage.value = {
                message: '',
                duration: 3,
            }
        }
        updateJsonOutput()
    }
}

function updateJsonOutput() {
    jsonOutput.value = JSON.stringify(stevieData.value, null, 4)
}

function copyToClipboard() {
    navigator.clipboard.writeText(jsonOutput.value)
    showCopiedMessage.value = true
    setTimeout(() => {
        showCopiedMessage.value = false
    }, 2000)
}

function importFromJson() {
    try {
        const input = prompt('Paste JSON data:')
        if (input) {
            const data = JSON.parse(input)
            if (data.ideen && data.monolog) {
                stevieData.value = data
                selectedMonologIndex.value = -1
                updateJsonOutput()
            } else {
                alert('Invalid JSON structure! Must contain ideen and monolog arrays.')
            }
        }
    } catch (error) {
        alert('Invalid JSON format!')
    }
}

function downloadJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonOutput.value)
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', 'stevie.json')
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}


onMounted(() => {
    try {

        stevieData.value = {
            ideen: [
                {
                    message:
                        'Hallo, ich bin Stevie! Ich liebe es, Menschen bei ihren Programmierproblemen zu helfen. Womit kann ich Ihnen heute helfen?',
                    gameState: 'graph',
                    stevieState: 'normal',
                    duration: 3,
                },
            ],
            monolog: [
                {
                    title: 'test',
                    messages: [
                        {
                            message:
                                'Hallo, ich bin Stevie! Ich liebe es, Menschen bei ihren Programmierproblemen zu helfen. Womit kann ich Ihnen heute helfen?',
                            duration: 3,
                        },
                        {
                            message:
                                'Ich kann Ihnen bei einer Vielzahl von Programmierproblemen helfen, von der Fehlersuche bis hin zum Entwurf von Algorithmen. Lassen Sie mich einfach wissen, was Sie brauchen!',
                            duration: 3,
                        },
                    ],
                    stevieState: 'normal',
                },
            ],
        }
        updateJsonOutput()
    } catch (error) {
        console.error('Failed to load initial data:', error)
    }
})
</script>

<template>
    <div class="stevie-generator">
        <h1>Stevie JSON Creator</h1>

        <div class="container">
            <div class="editor-section">
                <div class="section-container">
                    <h2>Ideen</h2>
                    <div class="form-group">
                        <label>Nachricht:</label>
                        <textarea
                            v-model="newIdea.message"
                            rows="3"
                            placeholder="Geben Sie die Nachricht ein..."
                        ></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Game State:</label>
                            <select v-model="newIdea.gameState">
                                <option v-for="state in gameStates" :key="state" :value="state">
                                    {{ state }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Stevie State:</label>
                            <select v-model="newIdea.stevieState">
                                <option v-for="state in stevieStates" :key="state" :value="state">
                                    {{ state }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Duration (seconds):</label>
                            <input
                                type="number"
                                v-model.number="newIdea.duration"
                                min="1"
                                step="1"
                            />
                        </div>
                    </div>

                    <div class="button-row">
                        <button @click="addIdea" class="add-btn">
                            {{ isEditingIdea ? 'Speichern' : 'Idee hinzufügen' }}
                        </button>
                        <button v-if="isEditingIdea" @click="cancelEditIdea" class="cancel-btn">
                            Abbrechen
                        </button>
                    </div>
                    <div class="item-list">
                        <div
                            v-for="(idea, index) in stevieData.ideen"
                            :key="index"
                            class="item"
                            :class="{ 'item-editing': isEditingIdea && editingIdeaIndex === index }"
                        >
                            <div class="item-content">
                                <p><strong>Nachricht:</strong> {{ idea.message }}</p>
                                <p><strong>Game State:</strong> {{ idea.gameState }}</p>
                                <p><strong>Stevie State:</strong> {{ idea.stevieState }}</p>
                                <p><strong>Duration:</strong> {{ idea.duration }}s</p>
                            </div>
                            <div class="item-buttons">
                                <button @click="editIdea(index)" class="edit-btn">
                                    Bearbeiten
                                </button>
                                <button @click="removeIdea(index)" class="remove-btn">
                                    Entfernen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-container">
                    <h2>Monologe</h2>

                    <div class="section-monologs">
                        <div class="form-group">
                            <label>Titel:</label>
                            <input
                                type="text"
                                v-model="newMonolog.title"
                                placeholder="Monolog Titel"
                            />
                        </div>
                        <div class="form-group">
                            <label>Stevie State:</label>
                            <select v-model="newMonolog.stevieState">
                                <option v-for="state in stevieStates" :key="state" :value="state">
                                    {{ state }}
                                </option>
                            </select>
                        </div>
                        <div class="button-row">
                            <button @click="addMonolog" class="add-btn">
                                {{ isEditingMonolog ? 'Speichern' : 'Monolog hinzufügen' }}
                            </button>
                            <button v-if="isEditingMonolog" @click="cancelEditMonolog" class="cancel-btn">
                                Abbrechen
                            </button>
                        </div>

                        <div class="monolog-list">
                            <div
                                v-for="(monolog, index) in stevieData.monolog"
                                :key="index"
                                class="monolog-item"
                                :class="{
                                    selected: selectedMonologIndex === index,
                                    'item-editing': isEditingMonolog && editingMonologIndex === index
                                }"
                                @click="selectMonolog(index)"
                            >
                                <span>{{ monolog.title }}</span>
                                <span class="message-count">
                                    ({{ monolog.messages.length }} Nachrichten)
                                </span>
                                <span class="stevie-state-badge">{{ monolog.stevieState }}</span>
                                <div class="monolog-buttons">
                                    <button @click.stop="editMonolog(index)" class="edit-btn">
                                        Bearbeiten
                                    </button>
                                    <button @click.stop="removeMonolog(index)" class="remove-btn">
                                        X
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="selectedMonologIndex >= 0" class="section-messages">
                        <h3>
                            Nachrichten für "{{ stevieData.monolog[selectedMonologIndex].title }}"
                        </h3>

                        <div class="form-group">
                            <label>Nachricht:</label>
                            <textarea
                                v-model="newMonologMessage.message"
                                rows="3"
                                placeholder="Geben Sie die Nachricht ein..."
                            ></textarea>
                        </div>
                        <div class="form-group">
                            <label>Duration (seconds):</label>
                            <input
                                type="number"
                                v-model.number="newMonologMessage.duration"
                                min="1"
                                step="1"
                            />
                        </div>

                        <div class="button-row">
                            <button @click="addMonologMessage" class="add-btn">
                                {{ isEditingMessage ? 'Speichern' : 'Nachricht hinzufügen' }}
                            </button>
                            <button
                                v-if="isEditingMessage"
                                @click="cancelEditMonologMessage"
                                class="cancel-btn"
                            >
                                Abbrechen
                            </button>
                        </div>

                        <div class="item-list">
                            <div
                                v-for="(message, messageIndex) in stevieData.monolog[
                                    selectedMonologIndex
                                ].messages"
                                :key="messageIndex"
                                class="item"
                                :class="{
                                    'item-editing':
                                        isEditingMessage && editingMessageIndex === messageIndex,
                                }"
                            >
                                <div class="item-content">
                                    <p><strong>Nachricht:</strong> {{ message.message }}</p>
                                    <p><strong>Duration:</strong> {{ message.duration }}s</p>
                                </div>
                                <div class="item-buttons">
                                    <button
                                        @click="editMonologMessage(messageIndex)"
                                        class="edit-btn"
                                    >
                                        Bearbeiten
                                    </button>
                                    <button
                                        @click="removeMonologMessage(messageIndex)"
                                        class="remove-btn"
                                    >
                                        Entfernen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="output-section">
                <h2>JSON Output</h2>
                <div class="action-buttons">
                    <button @click="copyToClipboard" class="action-btn">Kopieren</button>
                    <span v-if="showCopiedMessage" class="copied-message">Kopiert!</span>
                    <button @click="downloadJson" class="action-btn">Download</button>
                    <button @click="importFromJson" class="action-btn">Importieren</button>
                </div>
                <pre class="json-output">{{ jsonOutput }}</pre>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stevie-generator {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

h1 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--color-heading);
}

h2 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-heading);
}

.container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.editor-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.section-container {
    background: var(--color-background-soft);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-border);
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: var(--color-text);
}

.form-row {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

textarea,
input,
select {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text);
    background-color: var(--color-background);
}

.add-btn {
    background-color: var(--green);
    color: black;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    min-width: 120px;
    text-align: center;
    height: 38px;
}

.add-btn:hover {
    background-color: #2ecc71;
}

.item-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 4px;
}

.item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-background);
    color: var(--color-text);
    transition: background-color 0.2s;
}

.item-editing {
    background-color: var(--color-background-mute);
    border-left: 3px solid var(--green);
}

.item:last-child {
    border-bottom: none;
}

.item-content {
    flex-grow: 1;
}

.item-content p {
    margin: 5px 0;
}

.item-buttons {
    display: flex;
    gap: 5px;
}

.remove-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
}

.remove-btn:hover {
    background-color: #f85c4d;
}

.output-section {
    background-color: var(--color-background-soft);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-border);
}

.json-output {
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
    padding: 15px;
    overflow-x: auto;
    white-space: pre-wrap;
    font-family: monospace;
    height: 600px;
    overflow-y: auto;
}

.action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.button-row {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    justify-content: flex-start;
    align-items: center;
    height: 38px;
}

.action-btn {
    background-color: #4466cc;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
}

.action-btn:hover {
    background-color: #5577dd;
}

.edit-btn {
    background-color: #4466cc;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.edit-btn:hover {
    background-color: #5577dd;
}

.cancel-btn {
    background-color: #62708b;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    min-width: 120px;
    text-align: center;
    font-size: 14px;
    height: 38px;
}

.cancel-btn:hover {
    background-color: #7a89a3;
}

.copied-message {
    color: var(--green);
    font-weight: bold;
    align-self: center;
    margin-left: 10px;
}

.monolog-list {
    margin-bottom: 20px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 4px;
}

.monolog-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    background-color: var(--color-background);
}

.monolog-item:last-child {
    border-bottom: none;
}

.monolog-item:hover {
    background-color: var(--color-background-mute);
}

.monolog-item.selected {
    background-color: var(--color-background-mute);
    border-left: 3px solid var(--green);
}

.message-count {
    color: var(--color-text);
    font-size: 0.9em;
    margin-left: 5px;
}

.section-messages {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);
}

.stevie-state-badge {
    background-color: #4466cc;
    color: white;
    font-size: 0.8em;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: 10px;
}

.monolog-buttons {
    display: flex;
    gap: 5px;
}
</style>
