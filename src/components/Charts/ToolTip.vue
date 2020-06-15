<template>
    <div ref="contents" class="tooltip_contents">
        <span data-popper-arrow class="arrow"></span>
        <slot></slot>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { createPopper, Instance, VirtualElement } from '@popperjs/core';

export default Vue.extend({
    props: {
        container: {
            required: true,
        },
        show: {
            type: Boolean,
            default: true,
        },
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        }
    },
    data() {
        return {
            instance: undefined as Instance|undefined,
            virtualElement: {
                getBoundingClientRect: undefined as (() => ClientRect)|undefined,
            } as VirtualElement
        };
    },
    mounted() {
        this.virtualElement.getBoundingClientRect = this.generateGetBoundingClientRect(this.x, this.y);
        this.instance = createPopper(this.virtualElement as VirtualElement,
                                     this.$refs.contents as HTMLElement,
                                     {
                                        placement: 'right',
                                        modifiers: [
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, 10],
                                                },
                                            },
                                        ],
                                     });
    },
    watch: {
        x: {
            handler(newValue) {
                this.updatePosition();
            }
        },
        y: {
            handler(newValue) {
                this.updatePosition();
            }
        },
    },
    methods: {
        updatePosition() {
            this.virtualElement.getBoundingClientRect = this.generateGetBoundingClientRect(this.x, this.y);
            if (this.instance !== undefined) {
                this.instance.update();
            }
        },
        generateGetBoundingClientRect(x = 0, y = 0): () => ClientRect {
            return () => ({
                width: 0,
                height: 0,
                top: y,
                right: x,
                bottom: y,
                left: x,
            });
        },
    },
});
</script>

<style>
.tooltip_contents {
    background-color: #000;
    padding: 4px 8px;
    color: #FFF;
}
.arrow,
.arrow::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: -1;
}
.arrow::before {
    content: '';
    transform: rotate(45deg);
    background: #000;
}
.tooltip_contents[data-popper-placement^='top'] > .arrow {
    bottom: -4px;
}

.tooltip_contents[data-popper-placement^='bottom'] > .arrow {
    top: -4px;
}

.tooltip_contents[data-popper-placement^='left'] > .arrow {
    right: -4px;
}

.tooltip_contents[data-popper-placement^='right'] > .arrow {
    left: -4px;
}
</style>
