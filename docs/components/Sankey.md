# Sankey

## Props

<!-- @vuese:Sankey:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|data|-|—|`true`|{nodes: [], links: []} as {nodes: Node[], links: Link[]}|
|width|-|`Number`|`true`|-|
|height|-|`Number`|`true`|-|
|colorLegendTitle|-|`String`|`false`|-|
|title|-|`String`|`false`|-|
|tooltipFormatter|-|`Function`|`false`|-|
|nodeIdSuperset|-|`Array`|`false`|-|
|nodeAlignment|-|—|`false`|NodeAlignment.Justify|
|nodeWidth|-|`Number`|`false`|36|
|nodePadding|-|`Number`|`false`|3|
|nodeColorMode|-|—|`false`|ColoringMode.Categorical|
|nodeColorProperty|-|—|`false`|id|
|linkColorMode|-|—|`false`|ColoringMode.Categorical|
|linkColorProperty|-|—|`false`|-|
|categoricalColormap|-|—|`false`|schemeDark2|
|quantitativeColormap|-|—|`false`|interpolatePuOr|
|noDataMessage|-|`String`|`false`|No data available.|

<!-- @vuese:Sankey:props:end -->


## Events

<!-- @vuese:Sankey:events:start -->
|Event Name|Description|Parameters|
|---|---|---|
|node-click|-|-|
|edge-click|-|-|

<!-- @vuese:Sankey:events:end -->


