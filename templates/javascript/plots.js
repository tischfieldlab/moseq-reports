var DataFrame = dfjs.DataFrame;

console.log(dataframe_json);

var columns = dataframe_json.columns;
var data = dataframe_json.data;

const df = new DataFrame(data, columns);

// This creates the dataframe used in creating the heatmap
heatmap_df = df.groupBy('syllable', 'group').aggregate(g => g.stat.mean('usage'))
		.rename('aggregation', 'usage');

heatmap_df.filter(row => row.get('group') === '+/CT_female').show();