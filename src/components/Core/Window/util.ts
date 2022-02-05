import { remote } from 'electron';

export const WINDOW_MIN_WIDTH: number = 260;
export const WINDOW_MIN_HEIGHT: number = 155;

export function isValidX(x: number): boolean {
    const [maxX, _] = remote.getCurrentWindow().getSize();

    return x < maxX;
}

export function isValidY(y: number): boolean {
    const [_, maxY] = remote.getCurrentWindow().getSize();

    return y < maxY;
}

export function isValidWidth(width: number, minWidth: number = WINDOW_MIN_WIDTH): boolean {
    return width >= WINDOW_MIN_WIDTH;
}

export function isValidHeight(height: number, minHeight: number = WINDOW_MIN_HEIGHT): boolean {
    return height >= WINDOW_MIN_HEIGHT;
}

export function applyAspectRatio(width: number, height: number, aspectRatio: number | undefined) : { width: number, height: number } {
    if (!aspectRatio) return { width, height };

    height = width / aspectRatio;
    width = height * aspectRatio;

    return {
        width,
        height
    };
}