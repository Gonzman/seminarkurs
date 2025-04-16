<template>
    <div class="speech-bubble">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
</script>

<style lang="css" scoped>
.speech-bubble {
    position: relative;
    padding: 15px;
    /* Reduced padding for better text fit */
    margin: 1em 0 0em;
    color: #000;
    background: linear-gradient(#ffffff, #ffffff);
    border-radius: 10px;
    max-width: 20rem;
    /* Adjusted max-width for better responsiveness */
    width: auto;
    /* Allow width to adjust based on content */
    font-size: 1rem;
    /* Adjust font size for better readability */
    word-wrap: break-word;
    /* Ensure long words break properly */
    line-height: 1.5;
    /* Improve text spacing */
}

.speech-bubble:after {
    content: "";
    position: absolute;
    bottom: -15px;
    left: 50px;
    display: block;
    width: 0;
    height: 0;

    border-top: 15px solid #ffffff;

    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
}
</style>
