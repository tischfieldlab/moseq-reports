<template>
    <div>
        <b-icon :icon="showModal ? 'gear-fill' : 'gear'" @click="showModal = !showModal" />

        <b-modal v-model="showModal" class='app-settings' size='xl' centered id='settings-modal' title='Settings'>
            <div class='settings-modal-content'>
                <!-- Settings Sidebar -->
                <SettingsSideBar />
            </div>
        </b-modal>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SettingsSideBar from '@/components/Core/Settings/SettingsSideBar.vue';
export default Vue.extend({
    components: {
        SettingsSideBar
    },
    data() {
        return {
            showModal: false,
        };
    },
});
</script>

<style lang="scss" scoped>
.b-icon {
    width: 48px;
    height: 48px;
    padding: 6px;
    cursor: pointer;
}

.settings-modal-content {
    height: 70vh;
}

</style>