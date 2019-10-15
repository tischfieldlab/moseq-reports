<template>
 <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div style="text-align: center;" class="modal-header">
            <slot style="text-align: center;" name="header">
              <h3 style="text-align: center;">Heatmap Settings</h3>
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              <heatmap-colors></heatmap-colors>
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <b-button variant="primary" class="modal-default-button" @click="$emit('close')">
                OK
              </b-button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';

import HeatmapColorSelection from '@/components/Heatmap/HeatmapColorSelection.vue';
import EventBus from '../../events/EventBus';

export default Vue.extend({
    name: 'settings-modal',
    components: {
        'heatmap-colors': HeatmapColorSelection,
    },
});
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 400px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
    text-align: center;
    margin-right: 0;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    padding-left: 20px;
    padding-right: 20px;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
