var DataFrame = dfjs.DataFrame;

console.log(dataframe_json);

var columns = dataframe_json.columns;
var data = dataframe_json.data;

const df = new DataFrame(data, columns);

// This creates the dataframe used in creating the heatmap
heatmap_df = df.groupBy('syllable', 'group').aggregate(g => g.stat.mean('usage'))
		.rename('aggregation', 'usage');

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 450 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

var svg = d3.select('#tester').append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var groups = heatmap_df.filter(row => row.get('group') !== 'unk_male').distinct('group').toArray()
var syllables = heatmap_df.distinct('syllable').toArray()

// Build X scales and axis:
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(groups)
  .padding(0.01);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))

// Build X scales and axis:
var y = d3.scaleBand()
  .range([ height, 0 ])
  .domain(syllables)
  .padding(0.01);
svg.append("g")
  .call(d3.axisLeft(y));

// Build color scale
var myColor = d3.scaleLinear()
  .range(["white", "#69b3a2"])
  .domain([1,100])