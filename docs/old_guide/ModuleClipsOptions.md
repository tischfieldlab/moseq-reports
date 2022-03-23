# Module Clip Options


## Computed
1. `Stream`: Returns the stream of the current module clip. If changed, it sends a signal for the store to mutate the current Module Clip settings through `updateComponentSettings`
2. `only_subclip`: Boolean that determines whether only subclips are allowed. If changed, it sends a signal for the store to mutate the current Module Clips settings through `updateComponentSettings`
3. `loop`: Boolean that determines whether clip will be looped. If changed, it sends a signal for the store to mutate the current Module Clips settings through `updateComponentSettings`.
