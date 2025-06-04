# Table of Contents 
1. [Considerations for Annotations](#anno)
2. [Annotating a Dataset](#data)

# Considerations for Annotations <a name="anno"> </a>
Try to annotate using a set of simplified and reusable tags that describe multiple instance of each
module, including locomotive status, head and nose position, as well as higher-order descriptions.
Examples: paused, scanning, sniff; or nose-down, dart; or rear-up; etc.

# Annotating a Dataset <a name="data"> </a>
1. Load the MSQ file that you were tasked with annotating. (see the section [Loading a Data File](#loadfile) )

2. Prepare your work area by adding any components, adjusting their size and position, and any
component specific settings. You can alternatively load a MSL layout file (see the section
[Loading a Layout File](#layoutfile)). For convenience, we have prepared a MSL layout file which is appropriate
for this protocol, and is available here:
https://drive.google.com/file/d/1vMijQ384Ex_vfkfFtETpvfH_P9NHBGaS/view?usp=sharing
3. Within your main filter(typically filter0):
    1. Ensure that Count Method is set to Usage.
    2. Ensure that Selected Syllable is set to 0.
    
4. At this point, your screen should appread similar to the figure below:
<br>
<img src="https://i.imgur.com/UjpfL94.png"> 

5. Now, for each moseq module do the following:
    1. Select the current module by changing the Selected Syllable to the next module to
be annotated. (If this is the first module to be annotated, you may leave this set to 0).
    2. Examine the Crowd Movies, Module Clips, and Spinogram components in order to
garner an understanding of the behavioral ethology of the current syllable.
 Be sure to look at multiple individuals within the Crowd Movie.
 Be sure to look at all examples available in the Module Clips. Observe the
videos with and without the Only Module Subclip option enabled.
 Be sure to look at all examples available in the Spinogram.
    3. Once satisfied with your impressions of the current module, place your annotations in
the excel sheet.
    4. Go back to step 5.1 and repeat for all modules.
6. Now, within your main filter (typically filter0), change the Count Method to Frames and
change Selected Syllable to 0. Repeat step 5 while keeping the Count Method set to
Frames until completed.