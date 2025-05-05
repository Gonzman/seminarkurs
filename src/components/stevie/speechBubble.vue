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
    padding: 20px;
    color: #000;
    background: linear-gradient(#ffffff, #ffffff);
    border-radius: 15px;
    min-width: 250px;
    max-width: 350px;
    width: auto;
    font-size: 1rem;
    word-wrap: break-word;
    line-height: 1.6;
    user-select: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: block;
    text-align: center;
    white-space: normal;
}

.speech-bubble:after {
    content: "";
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    width: 0;
    height: 0;
    border-top: 15px solid #ffffff;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
}
</style>
