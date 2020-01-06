
import hcluster from 'hclusterjs';

interface SyllableRow {
	name: number;
	usage: number[];
}

export default function clusterGen(rawData){
	var groupCluster = hcluster()
	  .distance('euclidean') // support for 'euclidean' and 'angular'
	  .linkage('avg')        // support for 'avg', 'max' and 'min'
	  //.verbose(true)         // false by default
	  .posKey('usage')    // 'position' by default

	  // pass in an array of objects w/ array values for 'position' or specified posKey()
	  //.data(colors);         // as an array of objects w/ array values for 'position'
	  .data(rawData);
	  
	let groupTree = groupCluster.tree();
	let groupOrder = getDenOrder(groupTree);

	let syl_total = rawData[0].usage.length;
	let group_total = rawData.length;

	let rawSylData = new Array<SyllableRow>();


	let i;
	let j;
	for(i=0; i<syl_total; i++){
		rawSylData[i] = {"name": i, "usage":[]};
		for(j=0; j<group_total; j++){
			rawSylData[i].usage[j] = rawData[j].usage[i];
		}
	}

	var sylCluster = hcluster()
	  .distance('euclidean') // support for 'euclidean' and 'angular'
	  .linkage('avg')        // support for 'avg', 'max' and 'min'
	  //.verbose(true)         // false by default
	  .posKey('usage')    // 'position' by default

	  // pass in an array of objects w/ array values for 'position' or specified posKey()
	  //.data(colors);         // as an array of objects w/ array values for 'position'
	  .data(rawSylData);

	let sylTree = sylCluster.tree();
	let sylOrder = getDenOrder(sylTree);

	let data = {
		"matrix": new Array<Array<number>>(),
		"rowJSON": sylTree,
		"colJSON": groupTree
	};


	for(i=0; i<syl_total; i++){
		for(j=0; j<group_total; j++){
			let g = rawData.find( obj =>  obj.name == groupOrder[j]);
			if(typeof data.matrix[i] === 'undefined'){
				data.matrix[i] = new Array<number>();
			}
			data.matrix[i][j] = g.usage[sylOrder[i]];
		}
	}
	return [data, groupOrder, sylOrder];
}

function getDenOrder(tree){
	return getDenRec(tree,[]);
}

function getDenRec(tree,denOrder){
	if(typeof tree.children === 'undefined'){
		denOrder[denOrder.length] = tree.name;
		return denOrder;
	}
	denOrder = getDenRec(tree.children[0],denOrder);
	denOrder = getDenRec(tree.children[1],denOrder);
	return denOrder;
}