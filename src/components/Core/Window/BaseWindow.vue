<template>
    <div
        :id="this.id"
        class="msqWindow"
        :style="{
            left: `${window_xpos}px`,
            top: `${window_ypos}px`,
            width: `${window_width}px`,
            height: `${window_height}px`,
            zIndex: `${zIndex}`,
        }"
        style="`z-index: ${this.zindex}`"
        @mousedown="this.windowClicked"
    >
        <div
            class="msq-window-titlebar noselect"
            data-draggable="msq-titlebar"
            @mousedown="this.onDragStart"
            @mouseover="this.onTitlebarHover"
            @mouseleave="this.onTitlebarLeave"
        >
            <span
                data-draggable="dataview-swatch"
                class="dataview-swatch"
                :id="$id('swatch')"
                :style="{ background: this.titlebar_color }"
            >
                <div class="titlebar-button-container">
                    <slot name="titlebarButtons"></slot>
                    <titlebar-button
                        :clicked="onCollapsedClicked"
                        :icon="isCollapsed ? 'caret-up-fill' : 'caret-down-fill'"
                    />
                    <b-button-close @click="this.onClose" class="close-button" />
                </div>
            </span>
                {{ this.title }}
        </div>
        <div
            :id="`window-content-${this.id}`"
            class="window-content"
            :style="{
                width: `${window_width - 2}px`,
                height: `${window_height - 37}px`
            }"
        >
            <slot></slot>
        </div>
        <div @mousedown="this.onResizeStart" class="noselect" v-if="!this.isCollapsed">
            <div data-direction="right" class="resizer resizer-r"></div>
            <div data-direction="left" class="resizer resizer-l"></div>
            <div data-direction="top" class="resizer resizer-t"></div>
            <div data-direction="top-right" class="resizer resizer-tr"></div>
            <div data-direction="top-left" class="resizer resizer-tl"></div>
            <div data-direction="bottom" class="resizer resizer-b"></div>
            <div data-direction="bottom-right" class="resizer resizer-br"></div>
            <div data-direction="bottom-left" class="resizer resizer-bl"></div>
      </div>
    </div>
</template>

<script lang="ts">
import { Position } from '@/store/datawindow.types';
import Vue from 'vue';
import TitlebarButton from '@/components/Core/Window/WindowTitlebarButton.vue';
import { applyAspectRatio, isValidHeight, isValidWidth } from './util';

enum ResizeType {
    Right = 'right',
    Left = 'left',
    Top = 'top',
    Bottom = 'bottom',
    TopRight = 'top-right',
    TopLeft = 'top-left',
    BottomRight = 'bottom-right',
    BottomLeft = 'bottom-left'
}

export default Vue.extend({
    name: 'BaseWindow',
    mounted() {
        this.collapseWindow();
    },
    components: {
        TitlebarButton
    },
    props: {
        id: {
            type: String,
            required: true
        },
        titlebar_color: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        height: {
            type: [Number],
            required: true
        },
        width: {
            type: [Number],
            required: true
        },
        pos: {
            type: Object,
            required: true
        },
        isMinimized: {
            type: Boolean,
            required: false,
            default: false
        },
        resizeable: {
            type: Boolean,
            required: false,
            default: true
        },
        minWidth: {
            type: Number,
            required: false,
            default: 260
        },
        minHeight: {
            type: Number,
            required: false,
            default: 155
        },
        aspectRatio: {
            type: Number,
            required: false,
            default: undefined,
        },
        zIndex: {
            type: Number,
            required: false,
        }
    },
    data() {
        return {
            isCollapsed: this.isMinimized,
            restoredHeight: this.height,
            titlebarHeight: 35,
            windowWidth: this.width,
            windowHeight: this.height,
            windowPos: this.pos,
            // Used for window move
            isDragging: false,
            prevDeltaX: 0,
            prevDeltaY: 0,
            // Used for resize
            isResizing: false,
            resizeElement: null as HTMLElement | null,
        };
    },
    computed: {
        window_width(): number {
            return this.windowWidth as number;
        },
        window_height(): number {
            return this.windowHeight as number + this.titlebarHeight;
        },
        window_xpos(): number {
            return (this.windowPos as Position).x;
        },
        window_ypos(): number {
            return (this.windowPos as Position).y;
        },
        aspect_ratio(): number {
            return this.aspectRatio;
        }
    },
    watch: {
        aspect_ratio: {
            handler(newValue) {
                const aspect = this.applyAspectRatio(this.windowWidth, this.windowHeight);
                this.windowWidth = aspect.width;
                this.windowHeight = aspect.height;
                this.$emit('onResized', {
                    width: this.windowWidth,
                    height: this.windowHeight
                });
            }
        },
        width: {
            handler(newValue: number) {
                this.windowWidth = newValue;
            }
        },
        height: {
            handler(newValue: number) {
                this.windowHeight = newValue;
            }
        },
        pos: {
            handler(newValue: Position) {
                this.windowPos = newValue;
            },
            deep: true
        }
    },
    methods: {
        // Used to set the z-index to be the max one
        windowClicked() {
            this.$emit('onWindowFocused');
        },
        onTitlebarHover() {
            if (!this.isDragging) document.body.style.cursor = 'grab';
        },
        onTitlebarLeave() {
            if (!this.isDragging) document.body.style.cursor = 'auto';
        },
        onDrag(event: MouseEvent) {
            if (this.isDragging) {
                const deltaX = event.clientX - this.prevDeltaX;
                const deltaY = event.clientY - this.prevDeltaY;

                this.prevDeltaX = event.clientX;
                this.prevDeltaY = event.clientY;

                this.windowPos.x += deltaX;
                this.windowPos.y += deltaY;
            }
        },
        onDragEnd() {
            this.prevDeltaX = 0;
            this.prevDeltaY = 0;
            this.isDragging = false;

            this.$emit('onMoved', { x: this.windowPos.x, y: this.windowPos.y });

            document.body.style.cursor = 'grab';

            document.onmouseup = null;
            document.onmousemove = null;
        },
        onDragStart(event: MouseEvent) {
            const target: HTMLElement | null = event.target as HTMLElement;
            // If we are clicking the buttons on the page, we don't want to be
            // able to drag the window
            if (target.dataset.draggable === undefined) { document.body.style.cursor = 'auto'; return; }
            this.prevDeltaX = event.clientX;
            this.prevDeltaY = event.clientY;
            this.isDragging = true;

            document.body.style.cursor = 'grabbing';

            document.onmouseup = this.onDragEnd;
            document.onmousemove = this.onDrag;
        },
        onResizeStart(event: MouseEvent) {
            if (!this.resizeable) return;
            this.resizeElement = event.target as HTMLElement;
            this.prevDeltaX = event.clientX;
            this.prevDeltaY = event.clientY;
            this.isResizing = true;

            document.onmousemove = this.onResize;
            document.onmouseup = this.onResizeEnd;
        },
        onResize(event: MouseEvent) {
            if (this.isResizing && !this.isCollapsed) {
                event.preventDefault();
                const deltaX = event.clientX - this.prevDeltaX;
                const deltaY = event.clientY - this.prevDeltaY;

                let newHeight = this.windowHeight;
                let newWidth = this.windowWidth;
                let newX = this.windowPos.x;
                let newY = this.windowPos.y;

                if (this.resizeElement === null) return;
                const resizeType: ResizeType = this.resizeElement.dataset.direction as ResizeType;

                let appliedAspectRatio = {
                    width: newWidth,
                    height: newHeight
                };

                // Do vertical resize
                switch(resizeType) {
                    case ResizeType.Top:
                    case ResizeType.TopRight:
                    case ResizeType.TopLeft:
                        newHeight = this.windowHeight - deltaY;
                        newY = this.windowPos.y + deltaY;
                        appliedAspectRatio = this.applyAspectRatio(newWidth, newHeight);
                    break;

                    case ResizeType.Bottom:
                    case ResizeType.BottomRight:
                    case ResizeType.BottomLeft:
                        newHeight = this.windowHeight + deltaY;
                        appliedAspectRatio = this.applyAspectRatio(newWidth, newHeight);
                    break;
                }

                // Do horizontal resize
                switch(resizeType) {
                    case ResizeType.TopRight:
                    case ResizeType.BottomRight:
                    case ResizeType.Right:
                        newWidth = this.windowWidth + deltaX;
                        appliedAspectRatio = this.applyAspectRatio(newWidth, newHeight);
                    break;

                    case ResizeType.BottomLeft:
                    case ResizeType.TopLeft:
                    case ResizeType.Left:
                        newWidth = this.windowWidth - deltaX;
                        newX = this.windowPos.x + deltaX;
                        appliedAspectRatio = this.applyAspectRatio(newWidth, newHeight);

                    break;
                }

                newWidth = appliedAspectRatio.width;
                newHeight = appliedAspectRatio.height;

                this.prevDeltaX = event.clientX;
                this.prevDeltaY = event.clientY;

                // Respect the min height and width
                if (isValidHeight(newHeight, this.minHeight)) {
                    this.windowHeight = newHeight;
                    this.windowPos.y = newY;
                }

                if (isValidWidth(newWidth, this.minWidth)) {
                    this.windowWidth = newWidth;
                    this.windowPos.x = newX;
                }
            }
        },
        onResizeEnd(event: MouseEvent) {
            this.prevDeltaY = 0;
            this.prevDeltaX = 0;
            this.isResizing = false;
            this.resizeElement = null;

            this.$emit('onResized', {
                width: this.windowWidth,
                height: this.windowHeight,
            });

            this.$emit('onMoved', {
                x: this.windowPos.x,
                y: this.windowPos.y,
            });

            document.onmouseup = null;
            document.onmousemove = null;
        },
        onClose(event: any) {
            this.$emit('onClosed', event);
        },
        onCollapsedClicked(event: any) {
            this.isCollapsed = !this.isCollapsed;
            this.collapseWindow();
        },
        collapseWindow() {
            if (this.$data.isCollapsed) {
                this.restoredHeight = this.windowHeight;
                this.windowHeight = 0;
            } else {
                this.windowHeight = this.restoredHeight;
            }

            this.$emit('onMinMaxToggle', {
                isMinimized: this.isCollapsed,
            });
        },
        applyAspectRatio(newWidth: number, newHeight: number): { width: number, height: number } {
            return applyAspectRatio(newWidth, newHeight, this.aspect_ratio);
        },
    },
});
</script>

<style scoped>
.resizer {
    position: absolute;
}

.resizer-r {
    cursor: ew-resize;
    height: 100%;
    right: 0;
    top: 0;
    width: 5px;
}

.resizer-l {
    cursor: ew-resize;
    height: 100%;
    left: 0;
    top: 0;
    width: 5px;
}

/* Placed at the bottom side */
.resizer-b {
    bottom: 0;
    cursor: ns-resize;
    height: 5px;
    left: 0;
    width: 100%;
}

.resizer-br {
    bottom: 0;
    cursor: nwse-resize;
    height: 5px;
    right: 0;
    width: 5px;
}

.resizer-bl {
    bottom: 0;
    cursor: nesw-resize;
    height: 5px;
    left: 0;
    width: 5px;
}

.resizer-t {
    top: 0;
    cursor: ns-resize;
    height: 5px;
    left: 0;
    width: 100%;
}

.resizer-tl {
    top: 0;
    cursor: nwse-resize;
    height: 5px;
    left: 0;
    width: 5px;
}

.resizer-tr {
    top: 0;
    cursor: nesw-resize;
    height: 5px;
    right: 0;
    width: 5px;
}

.msqWindow {
    background-color: white;
    border: 1px solid darkgray;
    position: absolute;
    overflow: hidden;
    border-radius: 4px;
}

.msq-window-titlebar {
    padding-top: 5px;
    color: black;
    padding-bottom: 5px;
    margin-left: -5px;
    padding-left: 12px;
    border-bottom: 1px solid darkgray;
    background-color: #e8e8e8;
}

.dataview-swatch {
    display: inline-block;
    vertical-align: text-top;
    width: 16px;
    margin-top: 1px;
    height: 16px;
    border-radius: 16px;
    border: 1px solid #c5c5c5;
    cursor: default;
}

.window-content {
    position: relative;
}

.titlebar-button-container {
    position: absolute;
    margin-top: -8px;
    right: 6px;
}

.titlebar-button-container svg {
    margin-left: 9px;
}

.close-button {
    margin-left: 5px;
    margin-top: 4px;
    cursor: pointer;
}

.noselect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Old versions of Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}
</style>