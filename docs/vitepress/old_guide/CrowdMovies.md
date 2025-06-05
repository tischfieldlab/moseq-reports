# CrowdMovies

## Methods
1. `show_video`: Displays video and updates size, playback rate, and whether video loops
2. `hide_video`: Hides video
3. `updateVideoSize`: updates video height based on current ratio between video and window.
4. `updateVideoPlaybackRate`: Updates Video Playback rate based on `settings.playback_rate` in Crowd Movie Settings.
5. `updateVideoLooping`: Updates whether video loops based on `settings.loop` in Crowd Movie Settings.
6. `updateCurrentTime()`: Updates current time based on time elapsed in video.

## Watchers

1. layout: updates layout based on current video size
2. settings.playback_rate: updates based on change in `updateVideoPlaybackRate`
3. settings.loop: updates whether video loops based on `updateVideoLooping`

## Computed
1. `crowd_movie_path`: Updates path to video based on changes to datasource and selected syllable