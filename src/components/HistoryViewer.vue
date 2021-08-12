<template>
    <div>
        <!--<b-button @click="pushFakeItem">add</b-button>-->
        <h3>Notification History</h3>
        <template v-if="items.length > 0">
            <b-toast :key="idx" v-for="(itm, idx) in items"
                :static="true"
                :visible="true"
                :no-auto-hide="true"
                :is-status="true"
                :no-close-button="true"
                :variant="itm.variant">

                <RenderNode class="message" :data="itm.message"></RenderNode>
                <small>
                    <Timeago :datetime="itm.time" :autoUpdate="60"></Timeago>
                    <a v-if="itm.details != null" href="#" v-b-toggle="$id('details-'+idx)" class="details-link">details</a>
                </small>

                <b-collapse v-if="itm.details != null" :id="$id('details-'+idx)"  class="mt-2">
                    <b-textarea :readonly="true" rows="5" v-model="itm.details" class="details-text" />
                </b-collapse>
            </b-toast>
        </template>
        <template v-else>
            <div class="no-items">There doesn't seem to be anything here.</div>
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
    },
});


</script>

<style scoped>
.message {
    font-size: 14px;
}
.b-toast {
    margin: 6px;
}
h3 {
    text-align: center;
    margin-top: 12px;
}
.no-items {
    text-align: center;
    font-size: 13px;
    color: #a5a5a5;
    margin-top: 24px;
}
a.details-link {
    margin-left: 10px;
}
.details-text {
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    white-space: pre;
}
</style>