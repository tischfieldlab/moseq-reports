<template>
    <keep-alive>
        <b-modal
            @shown="onModalShow"
            :title="title"
            v-model="show"
            header-bg-variant="dark"
            header-text-variant="light"
            body-bg-variant="light"
            body-text-variant="dark"
            hide-footer>
            
            <div :id="id" ref="body" class="modal-body"></div>
            
        </b-modal>
    </keep-alive>
</template>

<script lang="ts">
import  Vue from 'vue';


export default Vue.extend({
    name: 'settings-modal',
    props: {
        show: Boolean,
        owner: Vue
    },
    data(){
        return {
            title: "title",
            content: null,
            id:'modal-container',
        }
    },
    beforeMount(){
        this.content = this.$props.owner.settings;
        this.title = this.$props.owner.title + " Settings";
        this.id += this.$props.owner._uid;
    },
    mounted(){
        
    },
    methods:{
        onModalShow(){
            this.content.$mount();
            this.$refs.body.appendChild(this.content.$el);
        },
    }
});
</script>

<style lang="scss" scoped>

</style>
