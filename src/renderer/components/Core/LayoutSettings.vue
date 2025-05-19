<template>
    <BContainer fluid>
        <BRow>
            <BCol cols="2" align-self="center">
                <label class="font-weight-bold pt-0">Title</label>
            </BCol>
            <BCol>
                <BFormInput type="text" v-model.trim="title" />
            </BCol>
            <BCol cols="1" class="p-0"> &nbsp; </BCol>
        </BRow>
        <BRow>
            <BCol cols="2" align-self="center">
                <label class="font-weight-bold pt-0">Size</label>
            </BCol>
            <BCol>
                <BInputGroup prepend="W">
                    <BFormInput type="number" debounce="500" v-model.number="width" />
                </BInputGroup>
            </BCol>
            <BCol>
                <BInputGroup prepend="H">
                    <BFormInput type="number" debounce="500" v-model.number="height" />
                </BInputGroup>
            </BCol>
            <BCol cols="1" class="p-0">
                <BButton variant="link" size="sm" @click="resetSize" title="Reset size to default" class=".reset-size">
                    <i class="bi bi-arrow-counterclockwise fs-3 fw-bold"></i>
                </BButton>
            </BCol>
        </BRow>
        <BRow>
            <BCol cols="2" align-self="center">
                <label class="font-weight-bold pt-0">Position</label>
            </BCol>
            <BCol>
                <BInputGroup prepend="X">
                    <BFormInput type="number" debounce="500" min="0" v-model.number="positionX" />
                </BInputGroup>
            </BCol>
            <BCol>
                <BInputGroup prepend="Y">
                    <BFormInput type="number" debounce="500" min="0" v-model.number="positionY" />
                </BInputGroup>
            </BCol>
            <BCol cols="1" class="p-0"> &nbsp; </BCol>
        </BRow>
        <BRow>
            <BButton variant="link" @click="duplicateComponent" title="Duplicate this component">
                <i class="bi bi-files"> Duplicate this component</i>
            </BButton>
        </BRow>
    </BContainer>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import { useWindowsStore } from "@store/windows.store";

export default defineComponent({
    name: "ComponentName",
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { $wstate } = useWindowMixin(props.id);
        const title = computed({
            get: () => $wstate.title,
            set: (value: string) => {
                $wstate.updateComponentTitle({
                    title: value,
                });
            },
        });

        const width = computed({
            get: () => $wstate.width,
            set: (value: number) => {
                $wstate.updateComponentLayout({
                    width: value,
                });
            },
        });

        const height = computed({
            get: () => $wstate.height,
            set: (value: number) => {
                $wstate.updateComponentLayout({
                    height: value,
                });
            },
        });

        const positionX = computed({
            get: () => $wstate.pos_x,
            set: (value: number) => {
                $wstate.updateComponentLayout({
                    position_x: value,
                });
            },
        });

        const positionY = computed({
            get: () => $wstate.pos_y,
            set: (value: number) => {
                $wstate.updateComponentLayout({
                    position_y: value,
                });
            },
        });

        const resetSize = () => {
            console.log("Resetting size");
            $wstate.resetSize();
        };

        const windowsStore = useWindowsStore();
        const duplicateComponent = () => {
            windowsStore.duplicateWindow(props.id);
        };

        return {
            title,
            width,
            height,
            positionX,
            positionY,
            resetSize,
            duplicateComponent,
        };
    },
});
</script>
<style scoped>
.row {
    margin: 10px 0;
}

.input-group-text {
    width: 40px;
    text-align: center;
}
.reset-size {
    padding-top: 0;
    padding-bottom: 0;
}
</style>
