<template>
    <div>
        <b-button @click="pushFakeItem">add</b-button>
        <template v-for="itm in items" >
            <b-card :key="itm" :bg-variant="itm.variant" :text-variant="textVarForBgVar(itm.variant)">
                <RenderNode class="message" :data="itm.message"></RenderNode>
                <small :class="`text-${textVarForBgVar(itm.variant)}`"><Timeago :datetime="itm.time" autoUpdate="60"></Timeago></small>
            </b-card>
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { HistoryItem } from '@/store/history.types';

const RenderNode = Vue.extend({
    props: ['data'],
    render(h, context) {
        return h('div', this.data);
    },
});

export default Vue.extend({
    components: {
        RenderNode,
    },
    computed: {
        items(): HistoryItem[] {
            return this.$store.state.history.items.slice().reverse();
        },
    },
    methods: {
        pushFakeItem() {
            this.$store.commit('history/addEntry', {message: 'Some message to go to  history'});
        },
        textVarForBgVar(variant) {
            const dark = ['dark', 'success', 'danger'];
            if (dark.includes(variant)) {
                return 'white';
            }
            return 'dark';
        }
    },
});


</script>

<style scoped>
.message {
    font-size: 14px;
}
.card {
    margin: 3px;
}
</style>