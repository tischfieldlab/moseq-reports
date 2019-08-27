var DataFrame = dfjs.DataFrame;

console.log(dataframe_json);

var columns = dataframe_json.columns;
var data = dataframe_json.data;

const df = new DataFrame(data, columns);

let filter = ["CT/CT_male", "+/+_male", "+/CT_male"];

// This creates the dataframe used in creating the heatmap
heatmap_df = df.groupBy('syllable', 'group').aggregate(g => g.stat.mean('usage'))
        .rename('aggregation', 'usage');


heatmap_df.show()

// Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
var cohortGroups = heatmap_df.filter(col =>
    !col.get('group').includes('unknown')).distinct('group').toArray();

var excluded = [];
for (var i = 0; i < cohortGroups.length; i++)
{
    if (!filter.includes(cohortGroups[i][0]))
        excluded.push(cohortGroups[i]);
}

console.log(excluded);

for (var i = 0; i < filter.length; i++)
    heatmap_df = heatmap_df.filter(row => !row.get('group').includes(excluded[i]));

console.log(heatmap_df);
//console.log(cohortGroups.toArray());

var sylsNum = heatmap_df.select('syllable').distinct('syllable');
var usages = heatmap_df.select('usage');
var groups = heatmap_df.filter(col => !col.get('group').includes('unk')).distinct('group').toArray();

var data = [{
    x: groups,
    y: sylsNum.toArray(),
    z: usages.toArray(),
    type: 'heatmap',
}];

Plotly.plot('tester', data);
