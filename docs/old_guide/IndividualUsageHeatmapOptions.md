# Individual Usage Heatmap Options

## Computed

1. `selectedGroups`: returns current selectedGroup is changes occur to value of `this.dataview.selectedGroup`.
2. `colorscale`: returns colormap of data. Can update value of colormap if changed through signaling vue store to commit the `updateComponentSettings` mutation.
3. `syllable_order_type`: returns the type of ordering for a syllable. Can update the value if changed through signaling vue store to commit the `updateComponentSettings` mutation.
4. `syllable_order_dataset`: returns order for dataset. Can update the current order if changed through signaling vue store to commit the `updateComponentSettings` mutation.