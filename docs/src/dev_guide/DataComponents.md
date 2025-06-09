
# How to Create a New Data Component

## Initial Set up
Create a folder for the component inside the data_components folder (located in `src/renderer/components/DataComponents`). Create a Vue file for the component.

## Component Visibility
In order to view the component, it must be registered to the root Store. The method for registering the component is imported from @render/components/Core/index.ts and is called RegisterDataComponent. The method has the following parameters:
|Name|Description|
|:--|:--|
|friendly_name|The name that is visible under the Tools tab in moseq-reports.|
|component_type|Corresponds to the `name` parameter for components in Vue. This parameter is used in the the default_layout.msl file to create an initial layout for data insertion.|
|init_width|The initial width of the component.|
|init_height|The initial height of the component.|
|settings_type|Tells Vue the Settings Vue file to use for a specific component.|
|default_settings|The default settings for a component.|

Use the `useWindowMixin()` function to gain much build-in functionality. This method is generic for the type of the settings in order to ease use with typescript. It returns the following objects:

|Name|Description|
|:--|:--|
|$wstate|Reference to `Pinia` store backing this component|
|aspect_ratio|Computed ref holding the `aspect_ratio` of this component|
|spec|Computed ref holding the `ComponentRegistration` for this component|
|datasource|Computed ref holding the name of the data filter this component is bound to
|dataview|Computed ref holding a reference to the `Pinia` store backing the data filter this component is bound to.|
|settings|Computed ref holding a reference to the settings for this data component. Typed to `TSettings`.|
|layout|Computed ref holding layout information for this component. Has `width`, `height`, `position.x`, and `position.y`.|
|title|Computed ref holding the current title of this data component.
|is_hidden|Computed ref holding a boolean value describing if this component should be hidden (`true`) or not (`false`).|
|z_index|Computed ref holding the current z-index of this data component.

A simple component will look like this:
```vue
<template>
    <div>
        {{ settings.my_value }}
    </div>
</template>

<script>
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import RegisterDataComponent from "@render/components/Core";

RegisterDataComponent({
    friendly_name: '',
    component_type: '',
    settings_type: undefined,
    init_width: 400,
    init_height: 500,
    default_settings: {
        my_value: "Hello World!"
    },
});

interface MyComponentSettings {
    my_value: string
}

export default defineComponent({
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { datasource, dataview, $wstate, settings} = useWindowMixin<MyComponentSettings>(props.id);

        // your component logic

    }
});

</script>

<style scoped>

</style>
```

## Component Settings

Component Settings are defined inside the ```default_settings``` parameter inside the ```RegisterDataComponent``` method. These specific settings are called by referencing the variable through ```settings.value```. These settings are updated in the component options file. Upon a settings change, the settings are updated through a mutation to the store. For example, the CrowdMovies component has the following default settings:
```javascript
default_settings: {
     loop: true,
     playback_rate: 1.0,
 },
```
Therefore the settings that can be adjusted for the CrowdMovies component are ```loop``` and ```playback_rate```. Inside the settings file, specific settings updated through Vue computed properties  For example, the CrowdMoviesSettings component has the following to adjust the loop property of the video.
```javascript
computed: {
        loop: {
            get(): boolean {
                return this.settings.loop;
            },
            set(value: boolean) {
                $wstate.updateComponentSettings({
                    settings: {
                        loop: value,
                    },
                });
            },
        },
};
</script>
```
Upon a change to the component, the new value of ```loop``` will be returned and the settings for the component will be mutated in the store.


## Procuring data
Here is an example of how the `UsageHeatmap` component might load data for display:

```javascript

const aggregateView = shallowRef([]);

WatchEffect(() => {
    const dataset = [{
        type: 'map',
        columns: [
            [`usage_${dataview.value.countMethod.toLowerCase()}`, 'usage'],
            ['group', 'group'],
            [`id_${dataview.value.countMethod.toLowerCase()}`, 'syllable'],
        ],
    }, {
        type: 'filter',
        filters: {
            group: dataview.value.selectedGroups,
            syllable: dataview.value.selectedSyllables,
        },
    }, {
        type: 'aggregate',
        groupby: ['syllable', 'group'],
        aggregate: {
            usage: 'mean',
        },
    }]
    DataService.fetchData<any[]>("usage", newValue)
        .then((data) => {
            aggregateView.value = data;
        })
        .catch((error) => {
            console.error('Error loading data:', error);
        });
});

```