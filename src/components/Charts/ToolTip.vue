<template>
    <Portal>
        <div :id="$id('tooltip-contents')" class="tooltip_contents" v-show="show">
            <span data-popper-arrow class="arrow tt-arrow"></span>
            <slot></slot>
        </div>
    </Portal>
</template>


<script lang="ts">
import Vue from 'vue';
import { createPopper, Instance, VirtualElement } from '@popperjs/core';
import { Portal } from '@linusborg/vue-simple-portal';

export default Vue.extend({
    components: {
        Portal,
    },
    props: {
        container: {
            required: true,
        },
        show: {
            type: Boolean,
            default: false,
        },
        position: {
            type: Object,
            default: { x: 0, y: 0 },
        },
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
        this.$nextTick().then(() => {
            this.virtualElement.getBoundingClientRect = this.generateGetBoundingClientRect(this.position);
            this.instance = createPopper(this.virtualElement as VirtualElement,
                                        document.querySelector(this.$idRef('tooltip-contents')) as HTMLElement,
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
        });
    },
    watch: {
        position: {
            handler(newValue) {
                this.updatePosition();
            }
        },
    },
    methods: {
        updatePosition() {
            this.virtualElement.getBoundingClientRect = this.generateGetBoundingClientRect(this.position);
            if (this.instance !== undefined) {
                this.instance.update();
            }
        },
        generateGetBoundingClientRect(position: {x:number,y:number}): () => ClientRect {
            return () => ({
                width: 0,
                height: 0,
                top: position.y,
                right: position.x,
                bottom: position.y,
                left: position.x,
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
    z-index: 2147483647;
    font-size: 13px;
}
.arrow,
.arrow::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: -1;
}
.tt-arrow::before {
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
