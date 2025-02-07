import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MatchTheWire from '@/views/minigames/wire/MatchTheWire.vue'
import Encryption from '@/views/minigames/encryption/Encryption.vue'
import CircuitBreaker from '@/views/minigames/circuitbreaker/CircuitBreaker.vue'
import Level from '@/views/minigames/level'
import Graph from '@/views/main/Graph.vue'
import Test from '@/views/minigames/wire/Test.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/wire',
            name: 'wire',
            component: Test,
            props: { level: Level.HARD },
        },
        {
            path: '/caeser',
            name: 'caeser',
            component: Encryption,
        },
        {
            path: '/graph',
            name: 'Graph',
            component: Graph,
        },
        {
            path: '/circuitbreaker',
            name: 'circuitbreaker',
            component: CircuitBreaker,
            props: {
                sizeX: 64,
                sizeY: 34,
                startX: 0,
                startY: 15,
                startDirection: 3,
                speed: 0.18,
                map: '/4B+AeM//8z/gAAB4z//zP+eABgDP//M/5//mAA8YwD/j///ADxjAP+MAf9wPGAA/4AB//A8AAP///gB8fwHA///+AHx/AcD////+fH8f+P////58fx/4AB///nwPH/gAH//+fAAf+AAAP8B8AB/+AAA/wH/ADP4AAD/P/8AM/gB+AA//wAz+AH4AD/w58PgAfgAP/Dnw+AB///gAP/D5/+P/8AA/8Pn/4/wA3j/w+f/gfMDeP/A5+GB/wNw/A4A4AH/AwH8D+AA/H8PcfwP4AD8f49x8A/gAPx/j3BwD/wA/h+PYHAP/OD+AABgcADA4AAB4GADgMDhwMf/fwPwA+HAx/9/A/4P//j3/38D/g8=',
            },
        },

        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AboutView.vue'),
        },
    ],
})

export default router
