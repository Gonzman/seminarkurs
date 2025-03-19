export enum ParallaxDirection {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
}

export type ParallaxDirectionType = (typeof ParallaxDirection)[keyof typeof ParallaxDirection]
