<template>
    <b-container fluid>
        <b-row>
            <b-input-group prepend="Line Weight">
                <b-form-input v-model="line_weight" type="number" :number="true" min="1" max="10" />
            </b-input-group>
        </b-row>
        <b-row>
            <b-input-group prepend="Line Color">
                <chrome-picker v-model="line_color" :disableAlpha="true" />
            </b-input-group>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import { Chrome } from 'vue-color';
import { useWindowMixin,  } from "@render/components/Core/Window/WindowMixin";
import { defineComponent } from 'vue';
import { computed } from 'vue';


export default defineComponent({
    components: {
        'chrome-picker': Chrome,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { $wstate, settings } = useWindowMixin<SpinogramSettings>(props.id);
        
        const line_color = computed({
            get: () => settings.value.line_color,
            set: (value: boolean) => {
                $wstate.updateComponentSettings({
                    settings: { line_color: value },
                });
            },
        });

        const line_weight = computed({
            get: () => settings.value.line_weight,
            set: (value: boolean) => {
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

<style lang="scss" scoped>
.row{
    margin:10px 0;
}
</style>