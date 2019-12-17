<template>
    <footer id="myFooter">
        <div class="footer-copyright">
            <!--<span>© 2019 Jay A. Tischfield Lab</span>-->
        </div>
    </footer>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'footer-bar',
});
</script>

<style scoped lang="scss">
#myFooter {
    background-color: #3c3d41;
    color: white;
    padding-top: 3px;
    position: bottom;
    bottom: 0;
    width: 100%;
}

#myFooter .footer-copyright {
    background-color: #333333;
    padding-top: 3px;
    padding-bottom: 3px;
    text-align: center;
    font-size: 8px;
}
</style>
