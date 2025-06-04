# Detailed Usage Options

## Computed
1. `group_order_type`: returns current group order type. If changed, it sends a signal to the store to commit the `updateComponentSettings` mutation.
2. `group_order_dataset` returns current group order dataset. If changed, it sends a signal to the store to commit the `updateComponentSettings` mutation.
3. `show_points`: Boolean that determines whether points on heatmap will show. If changed, it sends a signal to the store to commit the `updateComponentSettings` mutation.

4. `show_boxplot`: Boolean that determines whether boxplot will be visible. If changed, it sends a signal to the store to commit the `updateComponentSettings` mutation.

5. `boxplot whiskers`: Whisker type that determines type of whisker shown on boxplot. If changed, it sends a signal to the store to commit the `updateComponentSettings` mutations.