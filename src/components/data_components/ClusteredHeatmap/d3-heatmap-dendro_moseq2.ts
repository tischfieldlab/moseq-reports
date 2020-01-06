
import * as d3 from 'd3';
import {cluster, hierarchy} from 'd3-hierarchy';
import {scaleQuantile, scaleSequential} from 'd3-scale';
import {interpolateViridis} from 'd3-scale-chromatic';
import {median } from 'd3-array';
import DataModel from '@/models/DataModel';

/*function labelsFromTree(nodes, cluster) {
    return nodes.filter((n) => !nodes[n].children || nodes[n].children.length === 0).map((n) => n.name[0]);
}*/

function elbow(d, i) {
    return 'M' + d.source.y + ',' + d.source.x
        + 'V' + d.target.x + 'H' + d.target.y;
}

interface MatrixPoint {
    row: number;
    col: number;
    value: number;
}

export default function (clusterData, parent) {
    
    let data = clusterData[0];
    let groupOrder = clusterData[1];
    let sylOrder = clusterData[2];

    if (!data || !data.matrix) {
        return;
    }

    const svg = d3.select(parent)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "150px");

    const margin = {top: 10, right: 0, bottom: 10, left: 0};
    //const height = 150 - margin.top - margin.bottom;

    const clusterSpace = 150; // size of the cluster tree
    const cellSize = 12;
    const colNumber = data.matrix[0].length;
    const rowNumber = data.matrix.length;
    const width = cellSize * colNumber + clusterSpace; // - margin.left - margin.right,
    const height = cellSize * rowNumber + clusterSpace; // - margin.top - margin.bottom,
    
    //const rowCluster = cluster().size([height - clusterSpace, clusterSpace]);
    const rowHierarchy = hierarchy(data.rowJSON)
    //const colCluster = cluster().size([width - clusterSpace, clusterSpace]);
    const colHierarchy = hierarchy(data.colJSON);

    // console.log(data);
    //const rowNodes = rowCluster(rowHierarchy);
    //const colNodes = colCluster(colHierarchy);
    //rowLabel = labelsFromTree(rowNodes, rowCluster),
    //colLabel = labelsFromTree(colNodes, colCluster);
    const rowLabel = sylOrder;
    const colLabel = groupOrder;

    var matrix = new Array<MatrixPoint>();
    for (var r = 0; r < rowNumber; r++) {
        for (var c = 0; c < colNumber; c++) {
            matrix.push({row: r + 1, col: c + 1, value: data.matrix[r][c]});
        }
    }

    var colorScale = scaleSequential(interpolateViridis)
        .domain([
            Math.min(...matrix.map((n) => n.value)),
            Math.max(...matrix.map((n) => n.value))
        ]);

    svg.selectAll("*").remove();

    svg.attr("width", width + margin.left + margin.right + clusterSpace)
        .attr("height", height + margin.top + margin.bottom + clusterSpace);

    svg.append("g")
        .selectAll(".rowLabelg")
        .data(rowLabel)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", (d, i) => (i + 1) * cellSize + clusterSpace)
        .style("text-anchor", "start")
        .attr("transform", "translate(" + (width + cellSize) + "," + cellSize / 1.5 + ")")
        .attr("class", (d, i) => "rowLabel mono r" + i)
        .text((d) => d as string);

    svg.append("g")
        .selectAll(".colLabelg")
        .data(colLabel)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", (d, i) =>  (i + 1) * cellSize)
        .style("text-anchor", "end")
        .attr("transform", "translate(" + cellSize / 2 + ",-6) rotate (-90)  translate( -" + (height + cellSize * 2) + "," + clusterSpace + ")")
        .attr("class", (d, i) => "colLabel mono c" + i)
        .text((d) => d as string);

    var heatMap = svg.append("g").attr("class", "g3")
        .selectAll(".cellg")
        .data(matrix)
        .enter()
        .append("rect")
        .attr("x", (d) => d.col * cellSize + clusterSpace)
        .attr("y", (d) => d.row * cellSize + clusterSpace)
        .attr("class", (d) =>  "cell cell-border cr" + (d.row - 1) + " cc" + (d.col - 1))
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", (d) => colorScale(d.value))
        .on("mouseover", function (d) {
            d3.select(this).classed("cell-hover", true);
            //Update the tooltip position and value
            d3.select("#d3tooltip")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 10) + "px")
                .select("#value")
                .html(
                    "Group: " + colLabel[d.col-1] + "<br>Syllable: " + rowLabel[d.row-1]
                    + "<br>Value: " + d.value
                    );
            //Show the tooltip
            d3.select("#d3tooltip").transition()
                .duration(200)
                .style("opacity", .9);
        })
        .on("mouseout", function () {
            d3.select(this).classed("cell-hover", false);
            d3.selectAll(".rowLabel").classed("text-highlight", false);
            d3.selectAll(".colLabel").classed("text-highlight", false);
            d3.select("#d3tooltip").transition()
                .duration(200)
                .style("opacity", 0);
        })
        .on("click", function(d) {
            DataModel.updateSelectedSyllable(rowLabel[d.row-1]);
        });

    //tree for rows
    var rTree = svg.append("g")
        .attr("class", "rtree").attr("transform", "translate (10, " + (clusterSpace + cellSize) + ")");
    var rlink = rTree.selectAll(".rlink")
        .data(rowHierarchy.links())
        .enter().append("path")
        .attr("class", "rlink")
        .attr("d", elbow);

    var rnode = rTree.selectAll(".rnode")
        // .data(rowNodes)
        .enter()
        .append("g")
        .attr("class", "rnode")
        .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")");

    //tree for cols
    var cTree = svg.append("g").attr("class", "ctree").attr("transform", "rotate (90), translate (10, -" + (clusterSpace + cellSize) + ") scale(1,-1)");
    var clink = cTree.selectAll(".clink")
        .data(colHierarchy.links())
        .enter().append("path")
        .attr("class", "clink")
        .attr("d", elbow);

    var cnode = cTree.selectAll(".cnode")
        // .data(colNodes)
        .enter()
        .append("g")
        .attr("class", "cnode")
        .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")");
};