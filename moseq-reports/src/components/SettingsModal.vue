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
import Vue from 'vue';


export default Vue.extend({
    name: 'settings-modal',
    props: {
        title: String,
        content: String,
        show: Boolean
    },
    data(){
      return {
        id:'modal-container',
      }
    },
    beforeMount(){
        this.id += this.content._uid;
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
