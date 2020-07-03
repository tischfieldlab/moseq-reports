<template>
    <div>
        <b-button @click="pushFakeItem">add</b-button>
        <template v-for="itm in items" >
            <b-card :key="itm">
                <RenderNode :data="itm.message"></RenderNode>
                <small class="text-muted"><Timeago :datetime="itm.time"></Timeago></small>
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
            this.$store.commit('history/addEntry', 'Some message to go to  history');
        },
    },
});


</script>

<style scoped>

</style>