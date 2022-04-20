<template>
    <div class="picker-container">
        <b-dropdown
            variant="white"
            :class="{ custom: isCustom }"
            :no-flip="true"
        >
            <template v-slot:button-content>
                <b-form-row v-if="selected" class="selected-value">
                    <b-col>
                        <color-scale-bar :interpolator="selected.value" />
                    </b-col>
                    <b-col>
                        {{ selected.text }}
                    </b-col>
                </b-form-row>
                <template v-else> Please select a color map </template>
            </template>
            <template v-for="(scales, cat) in options">
                <template v-if="category_enabled(cat)">
                    <b-dropdown-header :key="cat">{{ cat }}</b-dropdown-header>
                    <b-dropdown-item
                        v-for="option in scales"
                        :key="option.value"
                        :disabled="option.disabled"
                        @click="select(option)"
                    >
                        <b-form-row>
                            <b-col>
                                <color-scale-bar :interpolator="option.value" />
                            </b-col>
                            <b-col>
                                {{ option.text }}
                            </b-col>
                        </b-form-row>
                    </b-dropdown-item>
                </template>
            </template>
            <b-dropdown-header>Custom</b-dropdown-header>
            <b-dropdown-item @click="select(customOption)">
                <b-form-row>
                    <b-col>
                        <color-scale-bar :interpolator="customOption.value" />
                    </b-col>
                    <b-col> Custom </b-col>
                </b-form-row>
            </b-dropdown-item>
        </b-dropdown>
        <div v-show="isCustom" class="custom-container clearfix">
            <div
                class="swatch swatch-left"
                :style="{ 'background-color': custom1, float: 'left' }"
            >
                <b-button
                    size="sm"
                    variant="link"
                    :id="$id('one')"
                    title="Click to select starting color"
                    class="text-dark text-decoration-none color-button"
                >
                    <b-icon
                        icon="droplet-half"
                        :style="{ color: getContrast(custom1) }"
                    ></b-icon>
                </b-button>
            </div>
            <b-popover
                :target="$id('one')"
                triggers="click blur"
                placement="top"
            >
                <template v-slot:title>Start Color</template>
                <chrome-picker
                    :value="custom1"
                    @input="updateCustomColor1"
                    :disableAlpha="true"
                />
            </b-popover>

            <div
                class="swatch swatch-right"
                :style="{ 'background-color': custom2, float: 'right' }"
            >
                <b-button
                    size="sm"
                    variant="link"
                    :id="$id('two')"
                    title="Click to select ending color"
                    class="text-dark text-decoration-none color-button"
                >
                    <b-icon
                        icon="droplet-half"
                        :style="{ color: getContrast(custom2) }"
                    ></b-icon>
                </b-button>
            </div>
            <b-popover
                :target="$id('two')"
                triggers="click blur"
                placement="top"
            >
                <template v-slot:title>End Color</template>
                <chrome-picker
                    :value="custom2"
                    @input="updateCustomColor2"
                    :disableAlpha="true"
                />
            </b-popover>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import {
    GetInterpolatedScaleOptions,
    GetScale,
    getContrastingColor,
} from "../../../components/Charts/Colors/D3ColorProvider";
import { PropValidator } from "vue/types/options";
import { Chrome } from "vue-color";
import ColorScaleBar from "./ColorScaleBar.vue";

export default Vue.extend({
    components: {
        "chrome-picker": Chrome,
        ColorScaleBar: ColorScaleBar,
    },
    props: {
        value: {
            type: String,
        },
        categories: {
            type: Array,
        } as PropValidator<string[]>,
    },
    data() {
        return {
            selected: undefined as { text: string; value: string } | undefined,
            options: GetInterpolatedScaleOptions(),
            custom1: "#FFFFFF",
            custom2: "#000000",
        };
    },
    watch: {
        value: {
            handler(newValue) {
                if (newValue.startsWith("custom:")) {
                    const parts = newValue.split(":");
                    this.custom1 = parts[1];
                    this.custom2 = parts[2];
                    this.selected = this.customOption;
                } else {
                    for (const cat of Object.keys(this.options)) {
                        for (const scale of this.options[cat]) {
                            if (scale.value === newValue) {
                                this.selected = scale;
                                return;
                            }
                        }
                    }
                }
            },
            immediate: true,
        },
        customOption: {
            handler(newValue) {
                this.select(this.customOption);
            },
        },
    },
    computed: {
        isCustom(): boolean {
            return (
                this.selected !== undefined &&
                this.selected.value.startsWith("custom:")
            );
        },
        customOption(): { text: string; value: string } {
            return {
                text: "Custom",
                value: `custom:${this.custom1}:${this.custom2}`,
            };
        },
    },
    methods: {
        updateCustomColor1(value) {
            this.custom1 = value.hex;
        },
        updateCustomColor2(value) {
            this.custom2 = value.hex;
        },
        category_enabled(category: string) {
            if (this.categories && this.categories.length > 0) {
                return this.categories.includes(category);
            }
            return true;
        },
        select(option) {
            this.selected = option;
            this.$emit("input", option.value);
        },
        getContrast(hexcolor: string): string {
            return getContrastingColor(hexcolor) === "dark" ? "black" : "white";
        },
    },
});
</script>

<style scoped>
.swatch {
    /*width: 36px;
    height: 36px;*/
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
.picker-container >>> .dropdown-menu {
    max-height: 400px;
    overflow-y: auto;
}
.b-dropdown >>> .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-color: rgb(206, 212, 218);
    background: #ffffff;
}
.b-dropdown.custom >>> .btn {
    border-bottom-right-radius: 0;
}
</style>
