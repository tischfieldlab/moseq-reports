<template>
    <div class="picker-container">
        <BDropdown variant="light" :class="{ custom: isCustom }" :no-flip="true">
            <template #button-content>
                <BFormRow v-if="selected" class="selected-value">
                    <BCol>
                        <ColorScaleBar :interpolator="selected.value" />
                    </BCol>
                    <BCol>
                        {{ selected.text }}
                    </BCol>
                </BFormRow>
                <template v-else>
                    Please select a color map
                </template>
            </template>

            <template v-for="(scales, cat) in options" :key="cat">
                <template v-if="categoryEnabled(cat)">
                    <BDropdownHeader>{{ cat }}</BDropdownHeader>
                    <BDropdownItem v-for="option in scales" :key="option.value"
                        @click="select(option)">
                        <BFormRow>
                            <BCol>
                                <ColorScaleBar :interpolator="option.value" />
                            </BCol>
                            <BCol>
                                {{ option.text }}
                            </BCol>
                        </BFormRow>
                    </BDropdownItem>
                </template>
            </template>

            <BDropdownHeader>Custom</BDropdownHeader>
            <BDropdownItem @click="select(customOption)">
                <BFormRow>
                    <BCol>
                        <ColorScaleBar :interpolator="customOption.value" />
                    </BCol>
                    <BCol>
                        Custom
                    </BCol>
                </BFormRow>
            </BDropdownItem>
        </BDropdown>

        <!-- Custom Color Picker -->
        <div v-show="isCustom" class="custom-container clearfix">
            <div class="swatch swatch-left" :style="{ backgroundColor: custom1 }">
                <BButton size="sm" variant="link" :id="colorOneId" title="Click to select starting color"
                    class="text-dark text-decoration-none color-button">
                    <B-Icon icon="droplet-half" :style="{ color: getContrast(custom1) }" />
                </BButton>
            </div>
            <BPopover :target="colorOneId" triggers="click blur" placement="top">
                <template #title>Start Color</template>
                <ChromePicker :value="custom1" @input="updateCustomColor1" :disableAlpha="true" />
            </BPopover>

            <div class="swatch swatch-right" :style="{ backgroundColor: custom2 }">
                <BButton size="sm" variant="link" :id="colorTwoId" title="Click to select ending color"
                    class="text-dark text-decoration-none color-button">
                    <B-Icon icon="droplet-half" :style="{ color: getContrast(custom2) }" />
                </BButton>
            </div>
            <BPopover :target="colorTwoId" triggers="click blur" placement="top">
                <template #title>End Color</template>
                <ChromePicker :value="custom2" @input="updateCustomColor2" :disableAlpha="true" />
            </BPopover>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { Chrome } from "@ckpack/vue-color";
import { GetInterpolatedScaleOptions, getContrastingColor } from "@render/components/Charts/Colors/D3ColorProvider";
import ColorScaleBar from "./ColorScaleBar.vue";
import { BDropdown, BDropdownItem, BDropdownHeader, BFormRow, BCol, BButton, BPopover } from "bootstrap-vue-next";

export default defineComponent({
    name: "ColorScalePicker",
    components: {
        ChromePicker: Chrome,
        ColorScaleBar,
        BDropdown,
        BDropdownItem,
        BDropdownHeader,
        BFormRow,
        BCol,
        BButton,
        BPopover,
    },
    props: {
        value: { type: String },
        categories: { type: Array as () => string[] },
    },
    setup(props, { emit }) {
        const selected = ref<{ text: string; value: string } | undefined>();
        const options = ref(GetInterpolatedScaleOptions());
        const custom1 = ref("#FFFFFF");
        const custom2 = ref("#000000");
        const colorOneId = computed(() => `color-picker-one`);
        const colorTwoId = computed(() => `color-picker-two`);
        const customOption = computed(() => ({
            text: "Custom",
            value: `custom:${custom1.value}:${custom2.value}`,
        }));

        const isCustom = computed(() => selected.value?.value.startsWith("custom:") ?? false);
        const categoryEnabled = (category: string) => {
            return !props.categories || props.categories.length === 0 || props.categories.includes(category);
        };
        const select = (option: { text: string; value: string }) => {
            selected.value = option;
            emit("input", option.value);
        };
        const updateCustomColor1 = (value: any) => {
            custom1.value = value.hex;
            select(customOption.value);
        };

        const updateCustomColor2 = (value: any) => {
            custom2.value = value.hex;
            select(customOption.value);
        };

        watch(
            () => props.value,
            (newValue) => {
                if (!newValue) return;

                if (newValue.startsWith("custom:")) {
                    const parts = newValue.split(":");
                    custom1.value = parts[1];
                    custom2.value = parts[2];
                    selected.value = customOption.value;
                } else {
                    for (const cat of Object.keys(options.value)) {
                        for (const scale of options.value[cat]) {
                            if (scale.value === newValue) {
                                selected.value = scale;
                                return;
                            }
                        }
                    }
                }
            },
            { immediate: true }
        );

        return {
            selected,
            options,
            custom1,
            custom2,
            isCustom,
            customOption,
            categoryEnabled,
            select,
            updateCustomColor1,
            updateCustomColor2,
            getContrast: getContrastingColor,
            colorOneId,
            colorTwoId,
        };
    },
});
</script>

<style scoped>
.swatch {
    display: inline-block;
    margin: 3px;
}

.custom-container {
    display: block;
    border-bottom: 1px solid rgb(206, 212, 218);
    border-right: 1px solid rgb(206, 212, 218);
    background-color: rgb(233, 236, 239);
    border-bottom-right-radius: 4px;
}

.selected-value {
    display: inline-flex;
    width: 100%;
}

::v-deep(.dropdown-menu) {
    max-height: 400px;
    overflow-y: auto;
}

::v-deep(.BDropdown .btn) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-color: rgb(206, 212, 218);
    background: #ffffff;
}
</style>