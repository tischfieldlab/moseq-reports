<template>
    <BModal v-model="aboutWindowStore.show" title="About this app" size="lg" :centered="true" :no-footer="true">
        <div class="about-container">
            <img src="/img/mouse_trim.png" class="logo" alt="Logo" draggable="false" />
            <h1>moseq-reports v{{ version }}</h1>
            <h4>{{ description }}</h4>

            <p>{{ copyright }}</p>

            <table>
                <tbody>
                    <tr v-for="[name, value] in versions" :key="name">
                        <td>{{ name }}</td>
                        <td>{{ value }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="links">
                <a :href="homepage" target="_blank">
                    <BiGithub />
                    Homepage
                </a>
                <a :href="documentation" target="_blank">
                    <BiQuestionCircle />
                    Documentation
                </a>
                <a :href="bugs.url" target="_blank" class="report-issue">
                    <BiBugFill />
                    Report an Issue
                </a>
            </div>
        </div>
    </BModal>
</template>

<script setup lang="ts">
import {version, description, bugs, homepage, documentation} from '@render/../../package.json'
import {useAboutWindowStore} from '@store/aboutwin.store';
import BiBugFill from '~icons/bi/bug-fill';
import BiGithub from '~icons/bi/github';
import BiQuestionCircle from '~icons/bi/question-circle';

const aboutWindowStore = useAboutWindowStore();

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
.logo {
    width: auto;
    height: 200px;
    margin-bottom: 20px;
    opacity: 0.3;
}
.links {
    margin:20px 0;
}
.links a {
    margin: 0 20px;
}
a.report-issue {
    float: right;
}
</style>