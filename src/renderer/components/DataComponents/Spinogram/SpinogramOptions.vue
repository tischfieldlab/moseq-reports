<template>
    <BContainer fluid>
        <BRow>
            <BInputGroup prepend="Line Weight">
                <BFormInput v-model="line_weight" type="number" :number="true" min="1" max="10" />
            </BInputGroup>
        </BRow>
        <BRow>
            <BInputGroup prepend="Line Color">
                <chrome-picker v-model="line_color" :disableAlpha="true" />
            </BInputGroup>
        </BRow>
    </BContainer>
</template>

<script lang="ts">
import { Chrome } from "@ckpack/vue-color";
import { useWindowMixin,  } from "@render/components/Core/Window/WindowMixin";
import { defineComponent, computed } from 'vue';
import { SpinogramSettings } from './Spinogram.types';
import { BContainer, BFormInput } from 'bootstrap-vue-next';


export default defineComponent({
    components: {
        ChromePicker: Chrome,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { $wstate } = useWindowMixin<SpinogramSettings>(props.id);
        
        const line_color = computed({
            get: () => $wstate.settings.line_color,
            set: (value: { hex: string}) => {
                if (value.hex === $wstate.settings.line_color) {
                    return;
                }
                $wstate.updateComponentSettings({
                    settings: { line_color: value.hex },
                });
            },
        });

        const line_weight = computed({
            get: () => $wstate.settings.line_weight,
            set: (value: number) => {
                if (value === $wstate.settings.line_weight) {
                    return;
                }
                $wstate.updateComponentSettings({
                    settings: { line_weight: value },
                });
            },
        });


        return {
            line_color,
            line_weight,
        };

    },
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
</style>