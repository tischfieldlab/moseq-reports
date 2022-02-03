# ClusteredHeatmapBase

## Props

<!-- @vuese:ClusteredHeatmapBase:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|data|-|—|`true`|-|
|width|-|`Number`|`true`|-|
|height|-|`Number`|`true`|-|
|colorscale|-|`String`|`false`|interpolateViridis|
|vmin|-|—|`false`|undefined|
|vmax|-|—|`false`|undefined|
|columnKey|-|`String`|`true`|-|
|rowKey|-|`String`|`true`|-|
|valueKey|-|`String`|`true`|-|
|columnOrderType|-|`String`|`false`|OrderingType.HCluster|
|columnClusterDistance|-|`String`|`false`|HClusterDistance.Euclidean|
|columnClusterLinkage|-|`String`|`false`|HClusterLinkage.Avg|
|columnClusterK|-|`Number`|`false`|2|
|columnOrderValue|-|`String`|`false`|-|
|columnOrderDirection|-|`String`|`false`|SortOrderDirection.Asc|
|columnOrderDataset|-|`Array`|`false`|-|
|columnLabelColor|-|—|`false`|undefined|
|rowOrderType|-|`String`|`false`|OrderingType.HCluster|
|rowClusterDistance|-|`String`|`false`|HClusterDistance.Euclidean|
|rowClusterLinkage|-|`String`|`false`|HClusterLinkage.Avg|
|rowClusterK|-|`Number`|`false`|2|
|rowOrderValue|-|`String`|`false`|-|
|rowOrderDirection|-|`String`|`false`|SortOrderDirection.Asc|
|rowOrderDataset|-|`Array`|`false`|-|
|rowLabelColor|-|—|`false`|undefined|
|groupLabels|-|—|`true`|-|
|xAxisTitle|-|`String`|`false`|Group|
|yAxisTitle|-|`String`|`false`|Value|
|legendTitle|-|`String`|`false`|Value|
|selectedRow|-|`String` /  `Number`|`false`|null|
|selectedCol|-|`String`|`false`|null|
|tooltipFormatter|-|`Function`|`false`|-|
|noDataMessage|-|`String`|`false`|Sorry, no data available!|

<!-- @vuese:ClusteredHeatmapBase:props:end -->


## Events

<!-- @vuese:ClusteredHeatmapBase:events:start -->
|Event Name|Description|Parameters|
|---|---|---|
|row-order-changed|-|-|
|col-order-changed|-|-|
|heatmapClick|-|-|

<!-- @vuese:ClusteredHeatmapBase:events:end -->


