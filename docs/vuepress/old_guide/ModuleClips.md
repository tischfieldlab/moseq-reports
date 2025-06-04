# Module Clips

## Methods

1. `show_video` : function responsible for showing video, updating playback rate, and updating video size.
2.  `hide_video`: Hides video from being displayed.
3.   `updateVideoSize`: Updates size of video based on current ratio of video size to layout size.
4.   `updateVideoPlaybackRate` : Updates current video playback rate. Gets value of video playback rate through ModuleClipOptions.
5.   `updateCurrentTime`: Updates time lapsed in clip.
6.   `videoEnded`: Replays the current video.
7.   `onExampleClick` Updates current value of `example_num` through onclick in layout event.
8.   `onPrevExampleClick`: Decreases value of `example_num` to change video.
9.   `onNextExampleClick`: Increases value of `example_num` to change video.


## Computed

1. `Items`: returns moduleclips if changes occur to the dataset.
2.  `movie_path`: returns address of current moduleclips if change occurs to the selected item.
3. `subclip` : returns particular subclip in Module clips if `this.current_item` is changed.