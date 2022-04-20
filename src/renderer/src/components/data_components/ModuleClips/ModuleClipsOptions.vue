<template>
    <b-container fluid>
        <b-row>
            <b-input-group prepend="Video stream">
                <b-form-select v-model="stream" :options="stream_options" />
            </b-input-group>
        </b-row>
        <b-row>
            <b-form-checkbox v-model="only_subclip" switch
                >Only module subclip</b-form-checkbox
            >
        </b-row>
        <b-row>
            <b-form-checkbox v-model="loop" switch
                >Loop playback</b-form-checkbox
            >
        </b-row>
        <b-row>
            <b-input-group prepend="Playback rate">
                <b-form-input
                    v-model="playback_rate"
                    type="number"
                    :number="true"
                    min="0"
                    max="10"
                    step="0.1"
                />
                <div class="figure-caption">
                    A value of 1.0 results in normal playback speed. Values &gt;
                    1.0 result in faster playback, and values &gt; 0 and &lt;
                    1.0 result in slower playback.
                </div>
            </b-input-group>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from "vue";
import mixins from "vue-typed-mixins";
import WindowMixin from "../../../components/Core/Window/WindowMixin";

export default mixins(WindowMixin).extend({
    data() {
        return {
            stream_options: [
                { text: "RGB", value: "rgb" },
                { text: "Depth", value: "depth" },
                { text: "Composed", value: "composed" },
            ],
        };
    },
    computed: {
        stream: {
            get(): string {
                return this.settings.stream;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        stream: value,
                    },
                });
            },
        },
        only_subclip: {
            get(): boolean {
                return this.settings.only_subclip;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        only_subclip: value,
                    },
                });
            },
        },
        loop: {
            get(): boolean {
                return this.settings.loop;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        loop: value,
                    },
                });
            },
        },
        playback_rate: {
            get(): number {
                return this.settings.playback_rate;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        playback_rate: value,
                    },
                });
            },
        },
    },
});
</script>

<style lang="scss" scoped>
.row {
    margin: 10px 0;
}
</style>
