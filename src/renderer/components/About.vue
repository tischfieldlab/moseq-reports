<template>
    <BModal v-model="show_about" title="About this app" size="lg" :centered="true" :no-footer="true">
        <div class="about-container">
            <img src="/img/mouse_trim.png" alt="Logo" :style="{opacity: 0.5}" />
            <h1>moseq-reports {{ version }}</h1>
            <h3>{{ description }}</h3>

            <p>{{ copyright }}</p>

            <table>
                <tbody>
                    <tr v-for="[name, value] in versions" :key="name">
                        <td>{{ name }}</td>
                        <td>{{ value }}</td>
                    </tr>
                </tbody>
            </table>
            <a :href="homepage" target="_blank">Homepage</a>
            <a :href="bugs.url" target="_blank">Report an issue</a>
        </div>
    </BModal>
</template>
<script lang="ts">
export const show_about = ref(false);
</script>

<script setup lang="ts">
import {version, description, bugs, homepage} from '@render/../../package.json'
import { ref } from 'vue';


const copyright = `© 2019-${new Date().getFullYear()} Jay A. Tischfield Lab`;
const versions = ['electron', 'chrome', 'node', 'v8'].map(e => [e, process.versions[e]]);

</script>

<style scoped>
.about-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
</style>