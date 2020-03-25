<template>
    <b-container>
        <b-row>
            <b-col>
                <b-input-group prepend="Output Format">
                    <b-form-select v-model="format" :options="supported_formats" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Quality" :append="quality_str">
                    <b-form-input debounce="150" v-model.number="quality" type="range" min="0" max="100"></b-form-input>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Scale">
                    <b-form-input v-model.number="scale" type="number" min="0" max="10"></b-form-input>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-button ref="snapshot_button" @click="takeSnapshot()" class="float-right" :disabled="is_taking_snapshot">
                    <b-spinner v-show="is_taking_snapshot" small type="grow"></b-spinner>
                    Take Snapshot
                </b-button>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Snapshot, {ensureDefaults} from '@/components/data_components/Core/SnapshotHelper';


export default Vue.component('snapshot-settings', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            is_taking_snapshot: false,
            quality_str: '',
            supported_formats: Array<string>(),
        };
    },
    beforeMount() {
        ensureDefaults(this.getComponent() as Vue, this.$store);
        this.updateQualityStr();
    },
    mounted() {
        // console.log(this.$parent.$parent.$parent.$parent.$parent.$children[0].$children[0]);
        this.supported_formats = this.getSupportedFormats();
    },
    computed: {
        settings(): any {
            return this.$store.getters.getWindowById(this.id).settings.snapshot;
        },
        title(): string {
            return this.$store.getters.getWindowById(this.id).title;
        },
        format: {
            get(): string {
                return this.settings.format;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        snapshot: {
                            format: value,
                        },
                    },
                });
            },
        },
        quality: {
            get(): number {
                return this.settings.quality * 100;
            },
            set(value: number) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        snapshot: {
                            quality: value / 100,
                        },
                    },
                });
                this.updateQualityStr();
            },
        },
        scale: {
            get(): number {
                return this.settings.scale;
            },
            set(value: number) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        snapshot: {
                            scale: value,
                        },
                    },
                });
            },
        },
    },
    methods: {
        getComponent(): Vue {
            return this.$parent.$parent.$parent.$parent.$parent.$children[0].$children[0];
        },
        updateQualityStr() {
            this.quality_str = `${this.settings.quality * 100}%`;
        },
        takeSnapshot() {
            this.is_taking_snapshot = true;
            this.$nextTick(() => Snapshot(this.getComponent(), this.title, this.settings)
                .finally(() => this.is_taking_snapshot = false));
        },
        getSupportedFormats(): string[] {
            const options = ['png'];
            const svg = this.getComponent().$el.getElementsByTagName('svg').item(0);
            if (svg) {
                options.push('svg');
            }
            return options;
        },
    },
});


</script>

<style>
.row{
    margin:10px 0;
}
</style>