import { defineComponent, computed } from "vue";
import { DataWindowState, Layout } from "@store/datawindow.types";
import { DataviewState } from "@store/dataview.types";

import {useDataWindowStore} from "@store/datawindow.store";
import {useDataViewStore} from "@store/dataview.store";

export function useWindowMixin<TSettings>(id: string) {
    const $wstate = useDataWindowStore<TSettings>(id);

    const subid = computed(() =>  id.replace("datawindows/", "") );

    const spec = computed(() => $wstate.spec);
    const datasource = computed(() => $wstate.datasource);
    const dataview = useDataViewStore($wstate.datasource);
    const settings = computed(() => $wstate.settings as TSettings);
    const layout = computed(() => ({
        height: $wstate.height,
        width: $wstate.width,
        position: {
            x: $wstate.pos_x,
            y: $wstate.pos_y,
        },
    }) as Layout);
    const title = computed(() => $wstate.title);
    const is_hidden = computed(() => $wstate.is_hidden);
    const aspect_ratio = computed(() => $wstate.aspect_ratio);
    const z_index = computed(() => $wstate.z_index);

    return {
        subid,
        $wstate,
        aspect_ratio,
        spec,
        datasource,
        dataview,
        settings,
        layout,
        title,
        is_hidden,
        z_index,
    };
}

export default defineComponent({
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const mixin = useWindowMixin(props.id);
        return {
            ...mixin,
        };
    },
});
