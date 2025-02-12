// Get the dendrogram order from a tree structure
export function getDendrogramOrder(tree: any): string[] {
    return traverseDendrogram(tree, []);
  }
  
  // Recursive helper function for dendrogram order traversal
  function traverseDendrogram(tree: any, denOrder: string[]): string[] {
    if (!tree.children) {
      // Add leaf node to the order
      denOrder.push(tree.name);
      return denOrder;
    }
    // Recursively traverse left and right children
    traverseDendrogram(tree.children[0], denOrder);
    traverseDendrogram(tree.children[1], denOrder);
    return denOrder;
  }
  
  // Horizontal elbow connector path for dendrogram
  export function elbowH(d: { source: { x: number; y: number }; target: { x: number; y: number } }): string {
    return `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`;
  }
  
  // Vertical elbow connector path for dendrogram
  export function elbowV(d: { source: { x: number; y: number }; target: { x: number; y: number } }): string {
    return `M${d.source.x},${d.source.y}H${d.target.x}V${d.target.y}`;
  }
  