<template>
    <Teleport to="body">
        <div :id="('tooltip-contents')" class="tooltip_contents" v-show="show" ref="tooltip"
            :data-popper-placement="placement">
            <span data-popper-arrow class="arrow tt-arrow"></span>
            <slot></slot>
        </div>
    </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, nextTick } from "vue";
import { createPopper, Instance, VirtualElement } from "@popperjs/core";
import { useTemplateRef } from "vue";
import { shallowRef } from "vue";

export default defineComponent({
    name: "Tooltip",
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        position: {
            type: Object as () => { x: number; y: number },
            default: () => ({ x: 0, y: 0 }),
        },
        placement: {
            type: String as () => "top" | "bottom" | "left" | "right",
            default: "right",
        },
    },
    setup(props) {
        const tooltip = useTemplateRef<HTMLDivElement>("tooltip");
        const instance = ref<Instance | undefined>(undefined);

        const virtualElement = shallowRef<VirtualElement>({
            getBoundingClientRect: () =>
                new DOMRect(props.position.x, props.position.y, 0, 0),
        });

        const updatePosition = () => {
            if (virtualElement.value) {
                virtualElement.value.getBoundingClientRect = () =>
                    new DOMRect(props.position.x, props.position.y, 0, 0);
            }
            instance.value?.update();
        };

        onMounted(() => {
            nextTick(() => {
                if (tooltip.value) {
                    instance.value = createPopper(
                        virtualElement.value,
                        tooltip.value,
                        {
                            placement: props.placement,
                            modifiers: [
                                {
                                    name: "offset",
                                    options: {
                                        offset: [0, 8],
                                    },
                                },
                            ],
                        }
                    );
                }
            });
        });

        watch(
            () => props.position,
            () => {
                updatePosition();
            }
        );

        return {
            tooltip,
            updatePosition,
        };
    },
});
</script>

<style scoped>
.tooltip_contents {
    background-color: #000;
    padding: 4px 8px;
    color: #fff;
    z-index: 2147483647;
    font-size: 13px;
    border-radius: 4px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}

.arrow,
.arrow::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: -1;
}

.tt-arrow::before {
    content: "";
    transform: rotate(45deg);
    background: #000;
}

.tooltip_contents[data-popper-placement^="top"]>.arrow {
    bottom: -4px;
}

.tooltip_contents[data-popper-placement^="bottom"]>.arrow {
    top: -4px;
}

.tooltip_contents[data-popper-placement^="left"]>.arrow {
    right: -4px;
}

.tooltip_contents[data-popper-placement^="right"]>.arrow {
    left: -4px;
}
</style>