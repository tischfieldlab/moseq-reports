import { Cluster } from "ml-hclust";

export function getDendrogramOrder(tree: any): string[] {
    return traverseDendrogram(tree, []);
}

function traverseDendrogram(tree: any, denOrder: string[]): string[] {
    if (!tree.children) {
        denOrder.push(tree.name);
        return denOrder;
    }

    traverseDendrogram(tree.children[0], denOrder);
    traverseDendrogram(tree.children[1], denOrder);
    return denOrder;
}

export function elbowH(d: { source: { x: number; y: number }; target: { x: number; y: number } }): string {
    return `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`;
}

export function elbowV(d: { source: { x: number; y: number }; target: { x: number; y: number } }): string {
    return `M${d.source.x},${d.source.y}H${d.target.x}V${d.target.y}`;
}


export function hydrateCluster(cluster: Cluster): Cluster {
    const clusterOut = new Cluster();

    clusterOut.height = cluster.height;
    clusterOut.size = cluster.size;
    clusterOut.index = cluster.index;
    clusterOut.isLeaf = cluster.isLeaf;
    clusterOut.children = cluster.children.map((child) => hydrateCluster(child));

    return clusterOut;
}