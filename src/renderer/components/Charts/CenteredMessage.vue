<template>
    <div v-if="show" class="centered-message">
      <BCard bg-variant="primary" text-variant="white" class="text-center">
        <BCardText>
          <slot>
            <!-- Default content if no slot is provided -->
            No content available.
          </slot>
        </BCardText>
      </BCard>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from "vue";
  
  export default defineComponent({
    name: "CenteredMessage",
    props: {
      // Boolean describing if the message should be shown
      show: {
        type: Boolean,
        default: true,
      },
    },
  });
  </script>
  
  <style scoped>
  .centered-message {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  .centered-message .card {
    width: 50%;
  }
  </style>
  