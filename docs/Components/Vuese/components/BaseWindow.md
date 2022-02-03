# BaseWindow

## Props

<!-- @vuese:BaseWindow:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|id|-|`String`|`true`|-|
|titlebar_color|-|`String`|`true`|-|
|title|-|`String`|`true`|-|
|height|-|`Number`|`true`|-|
|width|-|`Number`|`true`|-|
|pos|-|`Object`|`true`|-|
|minimizeable|-|`Boolean`|`false`|true|
|resizeable|-|`Boolean`|`false`|true|
|minWidth|-|`Number`|`false`|260|
|minHeight|-|`Number`|`false`|155|
|aspectRatio|-|`Number`|`false`|undefined|
|zIndex|-|`Number`|`false`|-|

<!-- @vuese:BaseWindow:props:end -->


## Events

<!-- @vuese:BaseWindow:events:start -->
|Event Name|Description|Parameters|
|---|---|---|
|onResized|-|-|
|onWindowFocused|-|-|
|onMoved|-|-|
|onClosed|-|-|

<!-- @vuese:BaseWindow:events:end -->


## Slots

<!-- @vuese:BaseWindow:slots:start -->
|Name|Description|Default Slot Content|
|---|---|---|
|titlebarButtons|-|-|
|default|-|-|

<!-- @vuese:BaseWindow:slots:end -->


