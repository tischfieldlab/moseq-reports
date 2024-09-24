<template>
  <HelloWorld />
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>


<style lang="scss">
#app{
  font-family: "Avenir", Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smooting: grayscale;
  color: #2c3e50;
}
#nav{
  padding: 30px;
  a {
    font-weight: bold;
    color:#2c3e50;
    &.router-link-exact-active {
      color:#42b983;
    }
  }
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
