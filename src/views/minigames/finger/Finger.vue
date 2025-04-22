<template>
    <div class="full-screen">
        <div class="base-div">
            <div class="aspect-horizontal">
                <div class="aspect-vertical">
                    <div class="content-div">
                        <h1>16:9 box</h1>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.full-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
}

.base-div {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: red;
}

.aspect-vertical,
.aspect-horizontal {
    aspect-ratio: 400 / 512;
    display: flex;
    align-items: center;
}

.aspect-horizontal {
    max-width: 100%;
    width: auto;
    height: 100%;
}

.aspect-vertical {
    width: 100%;
    height: auto;
}

.content-div {
    width: 100%;
    height: 100%;
    background-color: lightcoral;
    color: white;
    text-align: center;
}
</style>
