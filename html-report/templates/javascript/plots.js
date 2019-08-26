var DataFrame = dfjs.DataFrame;

console.log(dataframe_json);

var columns = dataframe_json.columns;
var data = dataframe_json.data;

const df = new DataFrame(data, columns);

df.show()

// This creates the dataframe used in creating the heatmap
heatmap_df = df.groupBy('syllable', 'group').aggregate(g => g.stat.mean('usage'))
        .rename('aggregation', 'usage');

heatmap_df.show()

// Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
var cohortGroups = heatmap_df.filter(row =>
    !row.get('group').includes('unk')).distinct('group'); var sylUsage =
        heatmap_df.select('usage');
var sylsNum = heatmap_df.select('syllable');

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 720 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#tester")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Build X scales and axis:
var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(cohortGroups)
    .padding(0.01);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

// Build X scales and axis:
var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(sylsNum.toArray())
    .padding(.5);
    svg.append("g")
    .call(d3.axisLeft(y));

// Build color scale
var myColor = d3.scaleLinear()
  .range(["white", "#69b3a2"])
  .domain(sylUsage)

svg.selectAll()
    .data(cohortGroups)
    .enter()
    .append('rect')
    .attr('x', function(d) { return x(d.group); })
    .attr('y', function(d) { return y(d.syllable); })
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) { return myColor(d.usage)} )
