# Individual Usage Heatmap

## Methods
1. `onHeatmapClick`: changes current selected syllable.
2. `rowOrderChanged`: changes row order by sending a signal to store to commit mutation publishDataset.
3. `colOrderChanged` changes column order by sending a signal to store to commit mutation publishDataset.
4. `heatmap_node_tooltip`: Gives UUID, Group, Module, and Usage current names based on the current data.

## Watch
`dataset`: Reacts to changes in the dataset and returns new dataset.

## Computed
1. `selectedGroups`: returns groups contained in aggregateView.
2. `selectedSyllable`: returns selected syllable, it can also change the selected syllable through signaling the store to commit the setSelectedSyllable mutation.
3. `countMethod`: returns  `this.dataview.countMethod` if changes occur to it.
4. `rowOrderDataset`: returns current order of dataset if changes occur to it.

