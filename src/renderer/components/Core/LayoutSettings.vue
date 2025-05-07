<template>
    <b-container fluid>
      <b-row>
        <b-col cols="2" align-self="center">
          <label class="font-weight-bold pt-0">Title</label>
        </b-col>
        <b-col>
          <BFormInput type="text" v-model.trim="title" />
        </b-col>
        <b-col cols="1" class="p-0"> &nbsp; </b-col>
      </b-row>
      <b-row>
        <b-col cols="2" align-self="center">
          <label class="font-weight-bold pt-0">Size</label>
        </b-col>
        <b-col>
          <BInputGroup prepend="W">
            <BFormInput type="number" debounce="500" v-model.number="width" />
          </BInputGroup>
        </b-col>
        <b-col>
          <BInputGroup prepend="H">
            <BFormInput type="number" debounce="500" v-model.number="height" />
          </BInputGroup>
        </b-col>
        <b-col cols="1" class="p-0">
          <BButton variant="link" @click="resetSize" title="Reset size to default">
            <i class="bi bi-arrow-counterclockwise fs-3 fw-bold"></i>
          </BButton>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="2" align-self="center">
          <label class="font-weight-bold pt-0">Position</label>
        </b-col>
        <b-col>
          <BInputGroup prepend="X">
            <BFormInput type="number" debounce="500" min="0" v-model.number="positionX" />
          </BInputGroup>
        </b-col>
        <b-col>
          <BInputGroup prepend="Y">
            <BFormInput type="number" debounce="500" min="0" v-model.number="positionY" />
          </BInputGroup>
        </b-col>
        <b-col cols="1" class="p-0"> &nbsp; </b-col>
      </b-row>
      <b-row>
        <BButton variant="link" @click="duplicateComponent" title="Duplicate this component">
          <i class="bi bi-files" > Duplicate this component</i>
        </BButton>
      </b-row>
    </b-container>
  </template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { UpdateComponentLayoutPayload, UpdateComponentTitlePayload } from "@render/store/datawindow.types";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin"; 

export default defineComponent({
    name: "ComponentName",
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const store = useStore();
        const { layout, $wstate } = useWindowMixin(props.id);
        const title = computed({
            get: () => $wstate.value.title,
            set: (value: string) => {
                store.commit(`${props.id}/updateComponentTitle`, {
                    id: props.id,
                    title: value,
                } as UpdateComponentTitlePayload);
            },
        });

        const width = computed({
            get: () => layout.value.width,
            set: (value: number) => {
                store.commit(`${props.id}/updateComponentLayout`, {
                    id: props.id,
                    width: value,
                } as UpdateComponentLayoutPayload);
            },
        });

        const height = computed({
            get: () => layout.value.height,
            set: (value: number) => {
                store.commit(`${props.id}/updateComponentLayout`, {
                    id: props.id,
                    height: value,
                } as UpdateComponentLayoutPayload);
            },
        });

        const positionX = computed({
            get: () => layout.value.position.x,
            set: (value: number) => {
                store.commit(`${props.id}/updateComponentLayout`, {
                    id: props.id,
                    position_x: value,
                } as UpdateComponentLayoutPayload);
            },
        });

        const positionY = computed({
            get: () => layout.value.position.y,
            set: (value: number) => {
                store.commit(`${props.id}/updateComponentLayout`, {
                    id: props.id,
                    position_y: value,
                } as UpdateComponentLayoutPayload);
            },
        });

        const resetSize = () => {
            store.dispatch(`${props.id}/resetSize`);
        };

        const duplicateComponent = () => {
            store.dispatch("datawindows/duplicateWindow", props.id);
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
</style>
