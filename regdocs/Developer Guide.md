# Developer Guide




## Electron
In the ```



## How to Create a New Component

#### Initial Set up
Create a folder for the component inside the data_components folder (located in src/components). Create a Vue file for the component.

#### Component Visibility
In order to view the component, it must be registered to the root Store. The method for registering the component is imported from @/components/index.ts and is called RegisterDataComponent. The method has the following parameters:
* friendly_name: The name that is visible under the Tools tab in moseq-reports.
* component_type: Corresponds to the `name` parameter for components in Vue. This parameter is used in the the default_layout.msl file to create an initial layout for data insertion.
* init_width: The initial width of the component.
* init_height: The initial height of the component.
* settings_type: Tells Vue the Settings Vue file to use for a specific component. 
* default_settings: The default settings for a component.

    
Each component gets it's ability to reference the script in the Component from the WindowMixin.ts file in src/components/Core/WindowMixin.ts.

A default component will look like this : 
```javascript
<template>
    <div>

    </div>
</template>

<script>
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import RegisterDataComponent from '@/components/Core';
RegisterDataComponent({
    friendly_name: '',
    component_type: '',
    settings_type: undefined,
    init_width: 400,
    init_height: 500,
    default_settings: {},
});
export default mixins(WindowMixin, LoadingMixin).extend({

});

</script>

<style lang="scss" scoped>

</style>
```

#### Component Settings

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
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        loop: value,
                    },
                });
            },
        },
});
</script>
```
Upon a change to the component, the new value of ```loop``` will be returned and the settings for the component will be mutated in the store.    