<template>
  <div class="speech-bubble">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="css" scoped>
.speech-bubble{
  position: relative;
  padding: 15px;
  margin: 1em 0 3em;
  color: #000;
  background: linear-gradient(#ffffff, #ffffff);
  border-radius: 10px;
  max-width: 10cm;
  width: 10vw;
}

.speech-bubble:after{
  content: "";
  position: absolute;
  bottom: -15px;
  left: 50px;
  display:block;
  width:0;
  height: 0;

  border-top: 15px solid #ffffff;

  border-left: 15px solid transparent;
  border-right: 15px solid transparent;

}
</style>
