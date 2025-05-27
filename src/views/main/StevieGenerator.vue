<template>
    <div class="stevie-generator">
        <div class="header">
            <h1>Stevie Generator</h1>
        </div>
        <div class="content">
            <div class="preview-container">
                <Stevie ref="stevieRef" class="stevie-preview" />                <div class="preview-controls">
                    <button class="btn primary" @click="playAnimation(selectedAnimation)">Play Animation</button>
                    <button class="btn secondary" @click="displayMessage(currentMessage)">Preview Message</button>
                    <button class="btn secondary" v-if="editIndex !== null" @click="playMessageWithAnimation(messages[editIndex])">Play with Animation</button>
                </div>
            </div>            <div class="tabs-container">
                <div class="tabs">
                    <div class="tab" :class="{ active: activeTab === 'messages' }" @click="activeTab = 'messages'">Messages</div>
                    <div class="tab" :class="{ active: activeTab === 'monologues' }" @click="activeTab = 'monologues'">Monologues</div>
                    <div class="tab" :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">Settings</div>
                </div>

                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <!-- Messages Tab -->
                <div class="tab-content" v-show="activeTab === 'messages'">
                    <div class="panel-columns">
                        <div class="panel-column">
                            <div class="panel-section">
                                <h3>Animation Settings</h3>
                                <form @submit.prevent class="form">
                                    <div class="form-group required">
                                        <label for="animation-type">Animation Type:</label>
                                        <select id="animation-type" v-model="selectedAnimation">
                                            <option value="idle">Idle</option>
                                            <option value="handy">Handy</option>
                                            <option value="exclamation">Exclamation</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label for="animation-duration">Duration (ms):</label>
                                        <input type="number" id="animation-duration" v-model.number="animationDuration" min="500" step="100" />
                                    </div>
                                </form>
                            </div>

                            <div class="panel-section">
                                <h3>Message Settings</h3>
                                <form @submit.prevent="addMessage" class="form">
                                    <div class="form-group required">
                                        <label for="message-text">Message Text:</label>
                                        <textarea id="message-text" v-model="currentMessage.message" rows="3" required></textarea>
                                    </div>

                                    <div class="form-group">
                                        <label for="message-duration">Display Duration (seconds):</label>
                                        <input type="number" id="message-duration" v-model.number="currentMessage.duration" min="1" step="1" />
                                    </div>

                                    <div class="form-group">
                                        <label for="game-state">Game State:</label>
                                        <input type="text" id="game-state" v-model="currentMessage.gameState" />
                                    </div>

                                    <div class="form-group">
                                        <label for="stevie-state">Stevie State:</label>
                                        <select id="stevie-state" v-model="currentMessage.stevieState">
                                            <option value="normal">Normal</option>
                                            <option value="angry">Angry</option>
                                            <option value="happy">Happy</option>
                                            <option value="sad">Sad</option>
                                            <option value="confused">Confused</option>
                                            <option value="scared">Scared</option>
                                        </select>
                                    </div>                                    <div class="button-row">
                                        <button type="submit" class="btn primary">{{ editIndex !== null ? 'Update' : 'Add' }} Message</button>
                                        <button type="button" class="btn secondary" @click="resetMessageForm">Clear</button>
                                        <button type="button" class="btn secondary" v-if="editIndex !== null" @click="previewEditingMessage()">Preview</button>
                                        <button type="button" class="btn danger" v-if="editIndex !== null" @click="removeMessage(editIndex)">Delete</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div class="panel-column">
                            <div class="panel-section">
                                <h3>Message List</h3>
                                <div class="message-list">
                                    <ul>                                        <li v-for="(message, index) in messages" :key="index">
                                            <div @click="editMessage(index)">
                                                {{ message.message.substring(0, 30) }}{{ message.message.length > 30 ? '...' : '' }}
                                                <span class="state-tag">{{ message.gameState || 'any' }} | {{ message.stevieState }}</span>
                                            </div>
                                            <div class="message-actions">
                                                <button class="btn-icon" @click.stop="playMessageWithAnimation(message)" title="Preview with animation">▶</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Monologues Tab -->
                <div class="tab-content" v-show="activeTab === 'monologues'">
                    <div class="panel-columns">
                        <div class="panel-column">
                            <div class="panel-section">
                                <h3>Monologue Settings</h3>
                                <form @submit.prevent="addMonologue" class="form">
                                    <div class="form-group required">
                                        <label for="monologue-title">Title:</label>
                                        <input type="text" id="monologue-title" v-model="currentMonologue.title" required />
                                    </div>

                                    <div class="button-row">
                                        <button type="submit" class="btn primary">{{ editMonologueIndex !== null ? 'Update' : 'Add' }} Monologue</button>
                                        <button type="button" class="btn secondary" @click="resetMonologueForm">Clear</button>
                                        <button type="button" class="btn danger" v-if="editMonologueIndex !== null" @click="removeMonologue(editMonologueIndex)">Delete</button>
                                    </div>
                                </form>

                                <div class="monologue-list">
                                    <h4>Monologue List</h4>
                                    <ul>
                                        <li v-for="(monologue, index) in monologues" :key="index" @click="editMonologue(index)">
                                            {{ monologue.title }}
                                            <span class="count-tag">{{ monologue.messages.length }} messages</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="panel-column">
                            <div class="panel-section">
                                <h3>Monologue Messages</h3>
                                <div class="form">
                                    <div class="form-group required">
                                        <label for="mono-message-text">Message Text:</label>
                                        <textarea id="mono-message-text" v-model="currentMonologueMessage.message" rows="3" required></textarea>
                                    </div>

                                    <div class="form-group">
                                        <label for="mono-message-duration">Display Duration (seconds):</label>
                                        <input type="number" id="mono-message-duration" v-model.number="currentMonologueMessage.duration" min="1" step="1" />
                                    </div>

                                    <div class="button-row">
                                        <button type="button" class="btn primary" @click="addMonologueMessage">{{ editMonologueMessageIndex !== null ? 'Update' : 'Add' }} Message</button>
                                        <button type="button" class="btn secondary" @click="resetMonologueMessageForm">Clear</button>
                                    </div>
                                </div>

                                <div class="mono-message-list">
                                    <h4>Current Monologue Messages</h4>
                                    <ul>                                        <li v-for="(message, index) in currentMonologue.messages" :key="index">
                                            <div @click="editMonologueMessage(index)">
                                                {{ message.message.substring(0, 30) }}{{ message.message.length > 30 ? '...' : '' }}
                                                <span class="duration-tag">{{ message.duration }}s</span>
                                            </div>
                                            <div class="message-actions">
                                                <button class="btn-icon" @click.stop="previewMonologueMessage(message)" title="Preview message">▶</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Settings Tab -->
                <div class="tab-content" v-show="activeTab === 'settings'">
                    <div class="panel-columns">
                        <div class="panel-column">
                            <div class="panel-section save-load">
                                <h3>Save & Export</h3>

                                <div class="form-group required">
                                    <label for="config-name">Config Name:</label>
                                    <input type="text" id="config-name" v-model="configName" required />
                                </div>

                                <div class="button-row">
                                    <button class="btn primary" @click="saveConfig">Save Config</button>
                                    <button class="btn secondary" @click="exportJSON">Export JSON</button>
                                </div>

                                <div class="form-group">
                                    <label for="config-select">Select Config:</label>
                                    <select id="config-select" v-model="selectedConfig">
                                        <option value="">-- Select a Config --</option>
                                        <option v-for="config in savedConfigs" :key="config.name" :value="config.name">
                                            {{ config.name }}
                                        </option>
                                    </select>
                                </div>

                                <div class="button-row">
                                    <button class="btn secondary" @click="loadConfig" :disabled="!selectedConfig">Load Config</button>
                                    <button class="btn danger" @click="deleteConfig" :disabled="!selectedConfig">Delete Config</button>
                                </div>

                                <div class="import-container">
                                    <label for="import-file" class="btn secondary">Import JSON</label>
                                    <input type="file" id="import-file" @change="importJSON" accept=".json" style="display: none;" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Stevie from '@/components/Stevie.vue'
import { useStevieStore } from '@/stores/stevie'
import { type StevieStateType } from '@/stores/stevie'

interface StevieMessage {
    message: string;
    gameState: string;
    stevieState: StevieStateType;
    duration: number;
}

interface MonologueMessage {
    message: string;
    duration: number;
}

interface StevieMonologue {
    title: string;
    messages: MonologueMessage[];
}

interface StevieConfig {
    ideen: StevieMessage[];
    monolog: StevieMonologue[];
}

const stevieRef = ref<InstanceType<typeof Stevie> | null>(null)
const stevieStore = useStevieStore()

const selectedAnimation = ref('idle')
const animationDuration = ref(2000)
const configName = ref('my-stevie-config')
const errorMessage = ref('')
const editIndex = ref<number | null>(null)
const editMonologueIndex = ref<number | null>(null)
const editMonologueMessageIndex = ref<number | null>(null)
const selectedConfig = ref('')
const savedConfigs = ref<Array<{ name: string, data: StevieConfig }>>([])
const activeTab = ref('messages')

const messages = ref<StevieMessage[]>([])
const monologues = ref<StevieMonologue[]>([])

const currentMessage = reactive<StevieMessage>({
    message: '',
    gameState: 'graph',
    stevieState: 'normal',
    duration: 3
})

const currentMonologue = reactive<StevieMonologue>({
    title: '',
    messages: []
})

const currentMonologueMessage = reactive<MonologueMessage>({
    message: '',
    duration: 3
})

// Helper to validate required fields
function validateRequiredFields(fields: {fieldName: string, value: any}[]): boolean {
    for (const field of fields) {
        if (!field.value || (typeof field.value === 'string' && !field.value.trim())) {
            errorMessage.value = `${field.fieldName} is required`
            return false
        }
    }
    return true
}

onMounted(() => {
    // Load saved configs from localStorage
    const savedData = localStorage.getItem('saved-stevie-configs')
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData)
            savedConfigs.value = parsed
        } catch (e) {
            console.error('Failed to parse saved configs', e)
        }
    }
})

// Play the selected animation
function playAnimation(type: string) {
    if (!stevieRef.value) return

    try {
        // Access the component's animation methods using type assertion
        const stevieComponent = stevieRef.value as any;

        if (type === 'idle') {
            stevieComponent.idleAnim?.() || stevieComponent.startCounter?.()
        } else if (type === 'handy') {
            stevieComponent.handyAnim?.()
        } else if (type === 'exclamation') {
            stevieComponent.anim?.(animationDuration.value, 'exclamation')
        }
    } catch (error) {
        console.error('Error playing animation:', error)
        errorMessage.value = 'Failed to play animation'
    }
}

// Play a message with corresponding animation
function playMessageWithAnimation(message: StevieMessage) {
    if (!stevieRef.value) return

    try {
        // Play the animation first
        const stevieComponent = stevieRef.value as any;

        // Select animation based on stevie state
        let animationType = 'idle';
        if (message.stevieState === 'happy' || message.stevieState === 'normal') {
            animationType = 'handy';
        } else if (message.stevieState === 'angry' || message.stevieState === 'confused') {
            animationType = 'exclamation';
        }

        // Set mood first
        stevieStore.setStevieMood(message.stevieState);

        // Then play animation
        if (animationType === 'idle') {
            stevieComponent.idleAnim?.() || stevieComponent.startCounter?.();
        } else if (animationType === 'handy') {
            stevieComponent.handyAnim?.();
        } else if (animationType === 'exclamation') {
            stevieComponent.anim?.(animationDuration.value, 'exclamation');
        }

        // Display message after a short delay
        setTimeout(() => {
            displayMessage(message);
        }, 300);

    } catch (error) {
        console.error('Error playing message with animation:', error);
        errorMessage.value = 'Failed to play message with animation';
    }
}

// Display a message
function displayMessage(message: StevieMessage) {
    if (!stevieRef.value) return

    try {
        stevieStore.setStevieMood(message.stevieState)

        // Access the component's speechText property directly
        const stevieComponent = stevieRef.value as any;
        stevieComponent.speeachText = message.message

        setTimeout(() => {
            stevieComponent.speeachText = ''
        }, message.duration * 1000)
    } catch (error) {
        console.error('Error displaying message:', error)
        errorMessage.value = 'Failed to display message'
    }
}

// Preview the current editing message
function previewEditingMessage() {
    if (editIndex.value === null) return;
    playMessageWithAnimation(currentMessage);
}

// Add a message to the list
function addMessage() {
    if (!validateRequiredFields([
        { fieldName: 'Message text', value: currentMessage.message }
    ])) {
        return
    }

    try {
        if (editIndex.value !== null) {
            // Update existing message
            messages.value[editIndex.value] = { ...currentMessage }
            editIndex.value = null
        } else {
            // Add new message
            messages.value.push({ ...currentMessage })
        }

        resetMessageForm()
        errorMessage.value = ''
    } catch (error) {
        console.error('Failed to add message:', error)
        errorMessage.value = 'Failed to add message'
    }
}

// Edit a message
function editMessage(index: number) {
    const message = messages.value[index]
    currentMessage.message = message.message
    currentMessage.gameState = message.gameState
    currentMessage.stevieState = message.stevieState
    currentMessage.duration = message.duration
    editIndex.value = index
}

// Remove a message
function removeMessage(index: number) {
    messages.value.splice(index, 1)
    resetMessageForm()
}

// Reset the message form
function resetMessageForm() {
    currentMessage.message = ''
    currentMessage.gameState = 'graph'
    currentMessage.stevieState = 'normal'
    currentMessage.duration = 3
    editIndex.value = null
}

// Add a monologue to the list
function addMonologue() {
    if (!validateRequiredFields([
        { fieldName: 'Monologue title', value: currentMonologue.title }
    ])) {
        return
    }

    try {
        if (editMonologueIndex.value !== null) {
            // Update existing monologue
            monologues.value[editMonologueIndex.value] = {
                title: currentMonologue.title,
                messages: [...currentMonologue.messages]
            }
            editMonologueIndex.value = null
        } else {
            // Add new monologue
            monologues.value.push({
                title: currentMonologue.title,
                messages: [...currentMonologue.messages]
            })
        }

        resetMonologueForm()
        errorMessage.value = ''
    } catch (error) {
        console.error('Failed to add monologue:', error)
        errorMessage.value = 'Failed to add monologue'
    }
}

// Edit a monologue
function editMonologue(index: number) {
    const monologue = monologues.value[index]
    currentMonologue.title = monologue.title
    currentMonologue.messages = [...monologue.messages]
    editMonologueIndex.value = index
}

// Remove a monologue
function removeMonologue(index: number) {
    monologues.value.splice(index, 1)
    resetMonologueForm()
}

// Reset the monologue form
function resetMonologueForm() {
    currentMonologue.title = ''
    currentMonologue.messages = []
    editMonologueIndex.value = null
    editMonologueMessageIndex.value = null
}

// Add a message to the current monologue
function addMonologueMessage() {
    if (!validateRequiredFields([
        { fieldName: 'Message text', value: currentMonologueMessage.message }
    ])) {
        return
    }

    try {
        if (editMonologueMessageIndex.value !== null) {
            // Update existing message
            currentMonologue.messages[editMonologueMessageIndex.value] = { ...currentMonologueMessage }
            editMonologueMessageIndex.value = null
        } else {
            // Add new message
            currentMonologue.messages.push({ ...currentMonologueMessage })
        }

        resetMonologueMessageForm()
        errorMessage.value = ''
    } catch (error) {
        console.error('Failed to add monologue message:', error)
        errorMessage.value = 'Failed to add monologue message'
    }
}

// Preview a monologue message
function previewMonologueMessage(message: MonologueMessage) {
    if (!stevieRef.value) return;

    try {
        // Create a temporary StevieMessage to display
        const tempMessage: StevieMessage = {
            message: message.message,
            duration: message.duration,
            gameState: 'graph',
            stevieState: 'normal'
        };

        // Choose an animation based on message content
        const stevieComponent = stevieRef.value as any;

        // Default to handy animation for monologue messages
        stevieComponent.handyAnim?.();

        // Display message after a short delay
        setTimeout(() => {
            displayMessage(tempMessage);
        }, 300);
    } catch (error) {
        console.error('Error previewing monologue message:', error);
        errorMessage.value = 'Failed to preview monologue message';
    }
}

// Edit a monologue message
function editMonologueMessage(index: number) {
    const message = currentMonologue.messages[index]
    currentMonologueMessage.message = message.message
    currentMonologueMessage.duration = message.duration
    editMonologueMessageIndex.value = index
}

// Reset the monologue message form
function resetMonologueMessageForm() {
    currentMonologueMessage.message = ''
    currentMonologueMessage.duration = 3
    editMonologueMessageIndex.value = null
}

// Save the current configuration
function saveConfig() {
    if (!configName.value.trim()) {
        errorMessage.value = 'Config name is required'
        return
    }

    try {
        if (messages.value.length === 0 && monologues.value.length === 0) {
            errorMessage.value = 'Nothing to save. Please add at least one message or monologue.'
            return
        }

        const config: StevieConfig = {
            ideen: [...messages.value],
            monolog: [...monologues.value]
        }

        // Check if we're updating an existing config
        const existingIndex = savedConfigs.value.findIndex(config => config.name === configName.value)

        if (existingIndex >= 0) {
            // Update existing config
            savedConfigs.value[existingIndex].data = config
        } else {
            // Add new config
            savedConfigs.value.push({
                name: configName.value,
                data: config
            })
        }

        // Save to localStorage
        localStorage.setItem('saved-stevie-configs', JSON.stringify(savedConfigs.value))
        alert(`Config "${configName.value}" saved successfully!`)
        errorMessage.value = ''
    } catch (error) {
        console.error('Save error:', error)
        errorMessage.value = 'Failed to save config'
    }
}

// Load a saved configuration
function loadConfig() {
    if (!selectedConfig.value) {
        errorMessage.value = 'Please select a config to load'
        return
    }

    const config = savedConfigs.value.find(c => c.name === selectedConfig.value)
    if (!config) {
        errorMessage.value = 'Config not found'
        return
    }

    // Load messages
    messages.value = [...config.data.ideen]

    // Load monologues
    monologues.value = [...config.data.monolog]

    // Set config name
    configName.value = selectedConfig.value

    alert(`Config "${selectedConfig.value}" loaded successfully!`)
}

// Delete a saved configuration
function deleteConfig() {
    if (!selectedConfig.value) {
        errorMessage.value = 'Please select a config to delete'
        return
    }

    const confirmDelete = confirm(`Are you sure you want to delete the config "${selectedConfig.value}"?`)
    if (!confirmDelete) return

    savedConfigs.value = savedConfigs.value.filter(config => config.name !== selectedConfig.value)
    localStorage.setItem('saved-stevie-configs', JSON.stringify(savedConfigs.value))
    selectedConfig.value = ''
    alert('Config deleted successfully')
}

// Export the configuration as JSON
function exportJSON() {
    try {
        if (messages.value.length === 0 && monologues.value.length === 0) {
            errorMessage.value = 'Nothing to export. Please add at least one message or monologue.'
            return
        }

        const config: StevieConfig = {
            ideen: [...messages.value],
            monolog: [...monologues.value]
        }

        const jsonString = JSON.stringify(config, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `${configName.value || 'stevie-config'}.json`
        a.click()

        URL.revokeObjectURL(url)

        errorMessage.value = ''
    } catch (error) {
        console.error('Export error:', error)
        errorMessage.value = 'Failed to export JSON'
    }
}

// Import configuration from JSON file
function importJSON(event: Event) {
    errorMessage.value = ''

    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        try {
            const content = e.target?.result as string
            const config = JSON.parse(content) as StevieConfig

            // Validate the imported JSON structure
            if (!config.ideen && !config.monolog) {
                errorMessage.value = 'Invalid config format. Missing both "ideen" and "monolog" properties.'
                return
            }

            // Load messages
            if (config.ideen) {
                messages.value = [...config.ideen]
            }

            // Load monologues
            if (config.monolog) {
                monologues.value = [...config.monolog]
            }

            // Set config name based on filename
            const filename = file.name.replace('.json', '')
            configName.value = filename

            errorMessage.value = ''
            alert('Config imported successfully!')
        } catch (error) {
            errorMessage.value = 'Failed to import config. Invalid JSON format.'
            console.error('Import error:', error)
        }

        // Reset the input to allow uploading the same file again
        input.value = ''
    }

    reader.readAsText(file)
}
</script>

<style scoped>
.stevie-generator {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.header {
    padding: 1rem;
    background-color: var(--color-background-mute);
    border-bottom: 1px solid var(--color-border);
}

h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--green);
}

.content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.preview-container {
    flex: 1;
    position: relative;
    background-color: var(--color-background);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--color-border);
}

.stevie-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-controls {
    position: absolute;
    bottom: 1rem;
    display: flex;
    gap: 1rem;
    padding: 0.5rem;
    background-color: var(--color-background-soft);
    border-radius: 4px;
    border: 1px solid var(--color-border);
}

.tabs-container {
    width: 400px;
    background-color: var(--color-background-soft);
    padding: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.tabs {
    display: flex;
    gap: 0;
    background-color: var(--color-background-mute);
    border-bottom: 1px solid var(--color-border);
}

.tab {
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    flex: 1;
    text-align: center;
    color: var(--color-text);
    border-right: 1px solid var(--color-border);
}

.tab:last-child {
    border-right: none;
}

.tab:hover {
    background-color: var(--color-background);
}

.tab.active {
    background-color: var(--green);
    color: black;
}

.tab-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
}

.panel-columns {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
}

.panel-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.panel-section {
    padding: 1rem;
    background-color: var(--color-background-mute);
    border-radius: 4px;
    border: 1px solid var(--color-border);
}

.panel-section:last-child {
    margin-bottom: 0;
}

h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--green);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
    font-size: 1.2rem;
    font-weight: 600;
}

h4 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 600;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

label {
    font-size: 0.9rem;
    color: var(--color-text);
}

input, select, textarea {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-background);
    color: var(--color-text);
    font-size: 0.9rem;
}

input[readonly] {
    background-color: rgba(100, 100, 100, 0.2);
    cursor: not-allowed;
}

input:focus, select:focus, textarea:focus {
    border-color: var(--green);
    outline: none;
}

textarea {
    resize: vertical;
    min-height: 60px;
}

.form-group.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
}

.button-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn.primary {
    background-color: var(--green);
    color: black;
}

.btn.primary:hover {
    background-color: #2ecc71;
}

.btn.secondary {
    background-color: #4466cc;
    color: white;
}

.btn.secondary:hover {
    background-color: #5577dd;
}

.btn.danger {
    background-color: #e74c3c;
    color: white;
}

.btn.danger:hover {
    background-color: #f85c4d;
}

.btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.hint {
    font-size: 0.8rem;
    color: #aaa;
    font-style: italic;
}

.hint-text {
    font-size: 0.8rem;
    color: #aaa;
    margin-top: 0.4rem;
    font-style: italic;
}

.required-mark {
    color: #dc3545;
}

.form-group.required label {
    position: relative;
}

.error-message {
    background-color: rgba(231, 76, 60, 0.2);
    border: 1px solid #e74c3c;
    color: #e74c3c;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.message-list, .monologue-list, .mono-message-list {
    margin-top: 1rem;
}

.message-list ul, .monologue-list ul, .mono-message-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.message-list li, .monologue-list li, .mono-message-list li {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    margin-bottom: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.message-list li > div:first-child {
    flex: 1;
    padding-right: 0.5rem;
}

.message-actions {
    display: flex;
    gap: 0.25rem;
}

.btn-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0;
    transition: all 0.2s;
}

.btn-icon:hover {
    background-color: var(--green);
    color: black;
}

.message-list li:hover, .monologue-list li:hover, .mono-message-list li:hover {
    background-color: var(--color-background);
}

.state-tag, .count-tag, .duration-tag {
    display: inline-block;
    padding: 2px 6px;
    margin-left: 0.5rem;
    background-color: var(--color-background-mute);
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--color-text);
}

.count-tag {
    background-color: #4466cc;
    color: white;
}

.duration-tag {
    background-color: var(--green);
    color: black;
}

.monologue-message-container {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 4px;
}

.import-container {
    margin-top: 1rem;
}

/* Display four message items per row in the knowledge selector */
.knowledge-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.5rem 0;
}

.knowledge-item {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    flex: 1;
    min-width: calc(50% - 0.5rem);
    background-color: var(--color-background);
    text-align: center;
    transition: background-color 0.2s;
}

.knowledge-item.selected {
    background-color: var(--green);
    color: black;
}

.knowledge-item:hover {
    background-color: var(--color-background-mute);
}

.knowledge-title {
    font-weight: 600;
}
</style>
