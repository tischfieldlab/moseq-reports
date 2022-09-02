export function getDendrogramOrder(tree) {
  return _getDendrogramOrder(tree, []);
}
function _getDendrogramOrder(tree, denOrder) {
  if (typeof tree.children === "undefined") {
    denOrder[denOrder.length] = tree.name;
    return denOrder;
  }
  denOrder = _getDendrogramOrder(tree.children[0], denOrder);
  denOrder = _getDendrogramOrder(tree.children[1], denOrder);
  return denOrder;
}
export function elbowH(d) {
  return `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`;
}
export function elbowV(d) {
  return `M${d.source.x},${d.source.y}H${d.target.x}V${d.target.y}`;
}
