# MSQ Files
MSQ Files are the format from which the moseq-reports program reads data including clips, IDs, and values. Think of it as a word document which requires the Microsoft Word program to access. Should you want to access the data stored in the msq file directly, you can change the extension from .msq to .zip and open it using a file archiver such as 7-Zip.

## Contents of .msq file
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