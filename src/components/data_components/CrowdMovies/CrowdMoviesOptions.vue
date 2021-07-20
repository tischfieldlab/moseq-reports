<template>
    <b-container fluid>
        <b-row>
            <b-form-checkbox v-model="loop" switch>Loop playback</b-form-checkbox>
        </b-row>
        <b-row>
            <b-input-group prepend="Playback rate">
                <b-form-input v-model="playback_rate" type="number" :number="true" min="0" max="10" step="0.1" />
                <div class="figure-caption">
                    A value of 1.0 results in normal playback speed. Values &gt; 1.0 result in faster playback,
                    and values &gt; 0 and &lt; 1.0 result in slower playback.</div>
            </b-input-group>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';

export default mixins(WindowMixin).extend({
     computed: {
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
.row{
    margin:10px 0;
}
</style>
