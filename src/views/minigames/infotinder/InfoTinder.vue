<template>
    <div class="full-screen">
        <div class="aspect-horizontal">
            <div class="aspect-vertical">
                <div class="base-div">
                    <div class="content-div">
                        <div class="image-div">
                            <img class="image"
                                src="https://search.tobi.tintuc.de/image_proxy?url=https%3A%2F%2Fts2.mm.bing.net%2Fth%3Fid%3DOIP.wpJyO-KhCv-q9ggZNdCcFwHaHa%26pid%3D15.1&h=d2ffc94669bf5e58b5bf47e5283d518e94a405e19a3b24d9e6fb735e4cbebc4f" />
                        </div>
                        <h2>Informations Tinder</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.full-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
}

.aspect-vertical,
.aspect-horizontal {
    --ar: calc(3 / 4);
    aspect-ratio: var(--ar);
    max-width: 100vw;
    display: flex;
    align-items: center;
}

.aspect-horizontal {
    width: auto;
    height: 100%;
}

.aspect-vertical {
    width: 100%;
    height: auto;
}

.base-div {
    width: 100%;
    height: 100%;
    padding: 3%;
}

.content-div {
    width: 100%;
    height: 100%;
    background-color: lightblue;
    --br: 3%;
    border-radius: var(--br) / calc(var(--br) * var(--ar));
    overflow: hidden;
}

.image-div {
    background-color: lightcoral;
    height: 70%;
}

.image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

h2 {
    background-color: red;
}
</style>
