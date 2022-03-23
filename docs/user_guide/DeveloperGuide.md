# Developer Guide
## Installation
```
git clone https://github.com/tischfieldlab/moseq-reports.git
cd moseq-reports
npm install
```

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Minimum Requirements
1. Node v14.0.0 (Required version)

### Operating System
1. macOS 10.11 (El Capitan) or newer
2. Windows 7 or newer
3. Ubuntu 10.04 or newer
4. Fedora 24 or newer
5. Debian 8 or newer

## MSQ Files
### crowd_movies
This folder contains a depth video for each syllable.
### scalars
This folder contains data for scalar data with a file for every syllable.
### syllable_clips
This folder contains up to 10 examples of each syllable with each example having three movies, one in RGB, one with depth, and one that is a composite of the previous two side by side.
### behaveDistances
Stores the behavior distance metric used to quantify distance.
### groups
A register of the group names.
### individual_transitions
An adjacency list of the transitions.
### label_map
Stores data for the label map with 0 being the most used for the usage and frame metrics. Maps between raw id, usage regime, and frame regime.
### manifest
A file manifest for the .msq file itself.
### samples
Columns used to organize sample data.
### spinograam
Stores the data for the spinogram with x and y for each time point and up to ten examples for each module.
### usage
Stores data regarding the quantification of usage with a count of the usage frames, how often each module is emitted. The uuid identifies the specific animal.

<!---## Components
[DatasetPicker](../components/DatasetPicker.md)

[EditableText](../components/EditableText.md)

[GroupBox](../components/groupbox.md)

[Sidebar](../components/Sidebar.md)

### Charts
[CenteredMessage](../components/CenteredMessage.md)

[Sankey](../components/Sankey.md)

[SVGHost](../components/SVGHost.md)

[ToolTip](../components/ToolTip.md)

[VideoPlayer](../components/VideoPlayer.md)

#### ClusteredHeatmap
[ClusteredHeatmapBase](../components/ClusteredHeatmapBase.md)

[ClusteredHeatmapCanvas](../components/ClusteredHeatmapCanvas.md)

[ClusteredHeatmapSVG](../components/ClusteredHeatmapSVG.md)

#### Colors
[ColorScaleBar](../components/ColorScaleBar.md)

[ColorScalePicker](../components/ColorScalePicker.md)

#### LinePlot
[LinePlotCanvas](../components/LinePlotCanvas.md)

[LinePlotSVG](../components/LinePlotSVG.md)

### Core
[BaseWindow](../components/BaseWindow.md)

[WindowTitlebarButton](../components/TitlebarButton.md)

#### data_components
[AggregateOperation](../components/AggregateOperation.md)

[ColumnSelector](../components/ColumnSelector.md)

[DatasetPublisher](../components/DatasetPublisher.md)

[DataView](../components/DataView.md)

[FilterOperation](../components/FilterOperation.md)

[MapOperation](../components/MapOperation.md)

[PluckOperation](../components/PluckOperation.md)

[SortOperation](../components/SortOperation.md)
