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
                sizeX: 64,
                sizeY: 34,
                startX: 0,
                startY: 15,
                startDirection: 3,
                speed: 0.18,
                map: '/4B+AeM//8z/gAAB4z//zP+eABgDP//M/5//mAA8YwD/j///ADxjAP+MAf9wPGAA/4AB//A8AAP///gB8fwHA///+AHx/AcD////+fH8f+P////58fx/4AB///nwPH/gAH//+fAAf+AAAP8B8AB/+AAA/wH/ADP4AAD/P/8AM/gB+AA//wAz+AH4AD/w58PgAfgAP/Dnw+AB///gAP/D5/+P/8AA/8Pn/4/wA3j/w+f/gfMDeP/A5+GB/wNw/A4A4AH/AwH8D+AA/H8PcfwP4AD8f49x8A/gAPx/j3BwD/wA/h+PYHAP/OD+AABgcADA4AAB4GADgMDhwMf/fwPwA+HAx/9/A/4P//j3/38D/g8=',
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
                max_space: 80,
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
                const debug = route.params.debug ?? false
                return { scene: scene, debug: debug }
            },
        },
    ],
})

export default router
