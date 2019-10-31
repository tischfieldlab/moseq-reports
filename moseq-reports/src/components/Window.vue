<template>
    <div>
        <div>
            <slot name="header">
                default header
            </slot>
        </div>
        <div>
            <slot name="body">
                default body
            </slot>
        </div>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';

export default Vue.component('ui-window', {});

</script>
<style lang="scss">
.UiCard {
  overflow: hidden;
  border: 1px solid #dfdfdf;
  border-radius: 0.25rem;
  background-color: #fff;
}

.UiCard__body {
  padding: 1em;
}
</style>