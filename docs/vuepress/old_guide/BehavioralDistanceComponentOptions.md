## Behavioral Distance Heatmap Options

# Computed

1. `method_options_spec`: In computed and watch, changes based on the current dataset. Retrieves data from store.
2. `group_options`: Contains current groups present on heatmap. If the dataView currently has no filter, it will return the entire datasource, otherwise it will return the filtered source.
3. `colorscale`: Setting for colorscale of the Heatmap. If changed, it will send a signal for the store to commit the `updateComponentSettings` mutation.
4. `distance_metric`: Setting for distance metric of the Heatmap. If changed, it will send a signal for the store to commit the `updateComponentSettings` mutation.