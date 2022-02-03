# Behavioral Distance Heatmap

## Methods

1. `onHeatmapClick` : changes current selected syllable based on area clicked in heatmap sends signal to store to run publishDataset method in mutations
2. `rowOrderChanged`: Changes Row Order
3. `colOrder`: Changes column order

## Watchers
1. `Dataset`: listens and reacts to changes in dataset.

## Computed

1. `rowOrderDataSet`: Reacts to changes in properties `row_order_dataset`, and `dataset.views` in settings` to return new row order

2. `columnOrderDataSet`: Reacts to changes in properties `column_order_dataset`, and `dataset.views` in settings to return new column ordering.

3. `selectedGroups`: Reacts to changes in dataview and returns groups that are not filtered