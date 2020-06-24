

export function getScaledContext2d(canvas: HTMLCanvasElement, width: number, height: number) {
    const ctx = canvas.getContext('2d');

    if(ctx !== null) {
        // Set display size (css pixels).
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Set actual size in memory (scaled to account for extra pixel density).
        const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);

        // Normalize coordinate system to use css pixels.
        ctx.scale(scale, scale);
    }
    return ctx;
}
