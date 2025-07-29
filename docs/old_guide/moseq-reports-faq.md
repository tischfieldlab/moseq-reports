# Table of Contents 
1. [Getting Started](#GettingStarted)
    1. [Installing moseq-reports](#example)
    2. [Loading a Data File](#loadfile)
    3. [Loading a Layout File](#layoutfile)
2. [Components](#component)
    1. [Selected Syllable](#select)
    2. [Usage Details](#usage)
    3. [Spinogram](#spinogram)
    4. [Usage Heatmap](#uheatmap)
    5. [Crowd Movies](#crowd)
    6. [Individual Usage Heatmap](#indheatmap)
    7. [Scalar Data](#scalar)
    8. [Position Plot](#position)
    9. [Sample Viewer](#samplev)
    10. [Distance Behavioral Heatmap](#behavior)
    11. [Module Clips](#module)
    12. [Syllable Flow](#flow)
    13. [State Map](#map)
    



# Getting Started <a name="GettingStarted"> </a>
## Installing moseq-reports <a name="example"> </a>
1. Download the software from the Google Drive Folder: 
https://drive.google.com/drive/folders/1fXBweex34ZNcm_Kk_PAJHwpBM_eiFl5_?usp=sharing
    a. For Windows systems, download moseq-reports-Setup-1.1.0.exe (or latest version).
    b. For Macintosh systems, download your preferred app format:
        * moseq-reports-1.1.0.dmg
        *moseq-reports-1.1.0-mac.zip
    c. For Linux systems, download from your preferred app format:
        * moseq-reports_1.1.0_amd64.deb
        * moseq-reports-1.1.0.AppImage
Install the app according to your operating system. For Windows Systems, Simply run the .exe file

## Loading a Data File <a name="loadfile"> </a> 
Moseq-reports uses files ending with the *.msq extension (MSQ files), which contain specially formatted data extracted from a model trained by the Moseq pipeline. Before you can visualize anything in moseq-reports, you must first load one of these data files. If you do not have one, please contact your friendly neighborhood data scientist to obtain a copy. There are three methods to load an MSQ file (in no particular order):

* From the main menu in the top left hand corner, select File Open
Data…. An open file dialog will appear that allows you to select the MSQ
file that you wish to load. This dialog may also be accessed through the
keyboard shortcut Ctrl+O. Once you have selected your file, click the
Open button to load your data.! <br> <img src="images/misc/file.png"  align=right>

 <br> <br> <br> 
 * You may also drag-and-drop your MSQ file from your systems file
explorer and onto the main window of moseq-reports. When you
hover your file over the window, you should see the window change
similar to the example on the right.<br> 
<img src="images/misc/mouse.png" style="float:right;"> 

 <br> <br> <br> <br>
 
* Once moseq-reports is installed on your system (valid for Windows and Mac), MSQ files
should appear with the moseq-reports icon. Double clicking on the MSQ file showing
this icon will load the file in an instance of moseq-reports.



## Layout File <a name="layoutfile" > </a>
Moseq-reports uses files ending with the *.msl extension (MSL files), which contain a snapshot of
your workspace settings. This includes which components are loaded, their position on the screen, their
component-specific settings, as well the state of all filters. Saving and loading these files gives you a way
to pick up where you left off in your analysis without having to recreate your environment. To save your
current layout, from the main menu, select View -> Save Layout…. There are two methods to load
an MSL file (in no particular order):

* From the main menu, select View -> Load Layout…. An open file
dialog will appear that allows you to select the MSL file that you wish to
load. Once you have selected your file, click the Open button to load
your layout.  <image src="images/misc/layout.png"  align=right>

 
 <br> <br> <br> 

<br>
* You may also drag-and-drop your MSL file from your systems file
explorer and onto the main window of moseq-reports. When you
hover your file over the window, you should see the window change
similar to the example on the right. <image src="https://i.imgur.com/ZRKIUvu.png"  align=right>

 <br> <br> <br> 
 

# Component <a name="component"> </a>
## Component Specific Settings 
Specific Settings can be accessed by clicking the gear icon in the title bar of the component. After clicking this button, a modal dialog will appear that offers settings for this component instance. There are a number of common tabs within this dialog:
 * Layout- Allows you to change the dimensions (width and height) and position (X, Y) of the
component in the main window. You can also edit the title that appears in the title bar of the
component.
* Data – Allows you to change which filter this component is bound to.
* Snapshots – Allows you to control some aspects of component snapshot generation
* Component – Allows you to control settings which are specific to this component type and
instance.
 

## Selected Syllable <a name="select"></a>
<img src="images/component/SelectedSyllable.png"> </img>

This component displays the current Moseq Module. This component has no additional settings.



## Sample Viewer <a name="samplev"></a>
This component displays general information such as UUID, Group, Apparatus, Session Name, Subject Name, and Acquisition Time of the groups in the dataset while also allowing this data to be filtered by any of this information. This component has no additional settings.

<img src="images/component/SampleViewer.png"> </img>

## Usage Heatmap <a name="uheatmap"></a>

<img src="images/component/Usage Heatmap.png" style="float:middle;"> </img>

Displays a heatmap, describing the magnitude of distance of different groups, of the current dataset. The heatmap can be clicked to change the current Selected Syllable, affecting the rest of the component's data. This component has the following settings:
* Colormap - Changes color scheme of Heatmap
* Syllable Ordering - Ability to toggle ordering of modules between:
    * Syllable ID
    * Syllable Value
    * Clustered
    * Dataset
* Group Ordering - Changes order of the groups, can be set to the data source order or clustered, which lets distance and linkage be taken into account.

<img src="images/Setting/UsageHeatmapSettings.png"> </img>

### Individual Usage Heatmap <a name="indheatmap"></a>
Displays a Heatmap of the magnitude of distance for one specific group inside a moseq module. This component inherits all settings from the Usage Heatmap.


## Usage Details <a name="usage"></a>
<img src="images/component/UsageDetails.png"> </img>

This component displays a vertical box and whisker plot for the current moseq module, separated into specific groups.

* Group ordering - Change whether to order the groups by the current filter or the dataset. Choosing dataset gives the option to display the data in Column or Row Order. Column Order show the dataset through group names; Row Order the dataset through group number.
* Data Points - Option to show all data points of the current moseq module, an increase in the point size results in a larger circle to represent the data point. 
* Boxplot - Option to display Boxplot of the dataset and adjust the Whiskers. The Whisker setting Tuskey results in Whiskers extending up to 1.5 * IQR from 25th and 75th percentile. The Whisker setting min max extends whiskers to the min and max data points.
* Violin Plot - Option to display Violin plot of the dataset.

<img src="images/Setting/UsageDetailSettings.png"/> 

## <a name="spinogram"> </a> Spinogram 
<img src="images/component/spinogram.png"/> 

This component displays “spinograms”, or a visualization of the height of a mouse’s spine (really the
axial midline) over the time course of the expression of the current moseq module. This component has
the following settings:
* Line Weight – Allows you to change the thickness of the plotted lines
* Line Color – Allows you to change the color of the plotted lines.

<img src="images/setting/spinogramsettings.png"/> 

## Crowd Movies <a name="crowd"> </a>
<img src="images/CrowdMovies.png"> </img>

This component displays “crowd movies”, or many examples of a given moseq module which are
synchronized and overlaid. A red dot over each mouse indicates the active performance of the current
module. This component has the following settings
* Loop Playback -– Enabling this will cause the movie to loop back to the beginning once the video has completed playing.
* Playback Rate - Sets the playback rate of the video. A value of one (1.0) results in normal
playback speed. Values greater than 1.0 result in faster playback, and values less than 1.0 (but
greater than zero) result in slower playback.
<img src="images/CrowdMoviesSettings.png"> </img>
 

## Module Clips <a name="module"> </a>
<img src="images/ModuleClips.png"> </img>

This component displays “module clips”, or specific single examples of a given moseq module using RGB,
depth, or composed (both) video streams. A red dot is displayed in the upper left hand corner of each
video indicating when the current module is being actively performed. This component has the following
settings:
* Video Stream – Allows you to select which video stream is displayed. Options are RGB (color
video), Depth (false-color depth video), or Composed (both RGB and Depth are displayed side by
side).
* Only Module Subclip – The videos displayed by this component include 2 seconds prior and 2
seconds post the current module performance. If this option is disabled, the full clip (including
before and after module performance) will be displayed. If this option is enabled, only the
subclip showing performance of the current module is displayed.
* Playback Rate – Sets the playback rate of the video. A value of one (1.0) results in normal
playback speed. Values greater than 1.0 result in faster playback, and values less than 1.0 (but
greater than zero) result in slower playback.

<img src="images/setting/ModuleClipSettings.png"> </img>

## Behavioral Distance Heatmap <a name="behavior"> </a>

<img src="images/component/BehavioralDistanceHeatmap.png"> </img>

Heatmap describing the magnitude of distance comparing two moseq modules. The component has the following settings:

* Behavioral distance metric - Change the distance metric of the heatmap between init and dtw. 
* Colormap - Changes color scheme of heatmap.
* Row Ordering - Offers ability to toggle order of rows between:
    * Syllable ID
    * Syllable Value
    * Dataset
    * Cluster
* Column Ordering- Offers ability to toggle order of rows between:
    * Syllable ID
    * Syllable Value
    * Dataset
    * Cluster
    
<img src="images/setting/BehavioralDistanceHeatmapSettings.png"> </img>


## Position plot <a name="position"> </a>
<img src="images/component/PositionPlot.png"> </img>

Displays the relative occupancy of groups in the current moseq module. This component has the following settings:

* Display Mode - Changes the plot display between overall occupany, and occupancy for specific groups.
* Colormap - Changes color scheme of position plot.
* Resolution - Changes how visible the data becomes.

<img src="images/Setting/PositionPlotSettings.png"> </img>


## Scalar Data <a name="scalar"></a>

<img src="images/component/ScalarPlot.png"> </img>

Displays the magnitude of the selected units of measurements for each group in a moseq module. The component has the following settings:
* Metric - Changes the units of measurement in the plot to one of the following:
    * Angle
    * Velocity 2D
    * Velocity 3D
    * Velocity Theta
    * Width 
    * Height 
    * Area
* Show Boxplot - Changes the visibility and type of whiskers for the boxplot.
* Violin Plot - Displays a violin plot of the data.

<img src="images/setting/ScalarDatasettings.png"> </img>

## State Map <a name="map"> </a>
to add
<img src="images/component/StateMap.png"> </img>



<img src="images/setting/StateMapsettings.png"> </img>

## Syllable Flow <a name="behavior"> </a>
to add
<img src="images/component/SyllableFlow.png"> </img>

<img src="images/setting/SyllableFlowSetting.png"> </img>
