import { createRouter, createWebHistory } from 'vue-router'
import Level from '@/views/minigames/level'
import FingerCopy from '@/views/minigames/finger/FingerCopy.vue'
import { useKnowledgeStore } from '@/stores/knowledge'
import { scenes } from '@/views/scenes/scenes'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Hauptmenu',
            component: () => import('../index.vue'),
        },
        {
            path: '/wire/:difficulty?',
            name: 'wire',
            component: () => import('../views/minigames/wire/Test.vue'),
            props: (route) => ({
                level: route.params.difficulty
                    ? (Level[
                          typeof route.params.difficulty === 'string'
                              ? (route.params.difficulty.toUpperCase() as keyof typeof Level)
                              : Level.EASY
                      ] ?? Level.EASY)
                    : Level.EASY,
            }),
            meta: { transition: 'slide-left' },
        },
        {
            path: '/caesar/:difficulty?',
            name: 'caesar',
            component: () => import('../views/minigames/encryption/Encryption.vue'),
            props: (route) => ({
                level: route.params.difficulty
                    ? (Level[
                          typeof route.params.difficulty === 'string'
                              ? (route.params.difficulty.toUpperCase() as keyof typeof Level)
                              : Level.EASY
                      ] ?? Level.EASY)
                    : Level.EASY,
            }),
        },
        {
            path: '/graph',
            name: 'Graph',
            component: () => import('../views/main/Graph.vue'),
        },
        {
            path: '/graph-creator',
            name: 'GraphCreator',
            component: () => import('../views/main/GraphCreator.vue'),
        },
        {
            path: '/stevie-generator',
            name: 'StevieGenerator',
            component: () => import('../views/main/StevieGenerator.vue'),
        },
        {
            path: '/circuitbreaker/:difficulty?',
            name: 'circuitbreaker',
            component: () => import('../views/minigames/circuitbreaker/CircuitBreaker.vue'),
            props: (route) => ({
                level: route.params.difficulty
                    ? (Level[
                          typeof route.params.difficulty === 'string'
                              ? (route.params.difficulty.toUpperCase() as keyof typeof Level)
                              : Level.EASY
                      ] ?? Level.EASY)
                    : Level.EASY,
            }),
        },
        {
            path: '/finger/:difficulty',
            name: 'finger',
            component: FingerCopy,
            props: (route) => {
                const difficultyKey =
                    typeof route.params.difficulty === 'string'
                        ? (route.params.difficulty.toUpperCase() as keyof typeof Level)
                        : 'EASY'
                const level = Level[difficultyKey] !== undefined ? Level[difficultyKey] : Level.EASY
                return { level: level }
            },
        },
        {
            path: '/infotinder',
            name: 'infotinder',
            component: () => import('../views/minigames/infotinder/InfoTinder.vue'),
            props: {
                max_space: 100,
                min_size: 6,
                max_size: 10,
            },
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/AboutView.vue'),
        },

        {
            path: '/scenes/:scene?/:debug?',
            name: 'scenes',
            component: () => import('../views/scenes/scenes.vue'),
            props: (route) => {
                const sceneKey =
                    typeof route.params.scene === 'string'
                        ? (route.params.scene.toUpperCase() as keyof typeof scenes)
                        : 'INTRO'
                const scene = scenes[sceneKey] !== undefined ? scenes[sceneKey] : scenes.INTRO
                const debug = route.params.debug === 'true'
                return { scene: scene, debug: debug }
            },
        },
        {
            path: '/ende',
            name: 'Bericht Ende',
            component: () => import('../views/main/End.vue'),
        },
    ],
})

export default router
