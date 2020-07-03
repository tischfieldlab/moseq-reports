<template>
    <div>
        <b-button @click="pushFakeItem">add</b-button>
        <template v-for="itm in items" >
            <b-card :key="itm">
                <b-card-text>
                    {{itm}}
                    <br />
                    <small class="text-muted">Last updated 3 mins ago</small>
                </b-card-text>
            </b-card>
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';


export default Vue.extend({
    computed: {
        items(): string[] {
            return this.$store.state.history.items;
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