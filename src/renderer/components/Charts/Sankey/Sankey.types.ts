import { SankeyExtraProperties, SankeyLink, SankeyLinkMinimal, SankeyNode } from "d3-sankey";


export interface Node {
    type: string;
    id: number;
    name: string;
}

export interface Link {
    type: string;
    id: string;
    color_id: number,
    source: string;
    target: string;
    value: number;
    real_value: number;
}

export enum NodeAlignment {
    Left = 'Left',
    Right = 'Right',
    Center = 'Center',
    Justify = 'Justify',
}

export enum NodeSortMethods {

}

export enum ColoringMode {
    Categorical,
    Quantitative,
}

type Modify<T, R> = Omit<T, keyof R> & R;


export type CompleteSankeyLink<N extends SankeyExtraProperties, L extends SankeyExtraProperties> = Modify<SankeyLink<N, L>, {
    /**
     * Link's vertical starting position (at source node) calculated by Sankey layout generator.
     */
    y0: number;
    /**
     * Link's vertical end position (at target node) calculated by Sankey layout generator.
     */
    y1: number;
    /**
     * Link's width (proportional to its value) calculated by Sankey layout generator.
     */
    width: number;
    /**
     * Link's zero-based index within the array of links calculated by Sankey layout generator.
     */
    index: number;
}>

export type CompleteSankeyNode<N extends SankeyExtraProperties, L extends SankeyExtraProperties> = Modify<SankeyNode<N, L>, {
    /**
     * Array of outgoing links which have this node as their source.
     * This property is calculated internally by the Sankey layout generator.
     */
    sourceLinks: Array<SankeyLink<N, L>>;
    /**
     * Array of incoming links which have this node as their target.
     * This property is calculated internally by the Sankey layout generator.
     */
    targetLinks: Array<SankeyLink<N, L>>;
    /**
     * Node's value calculated by Sankey layout Generator;
     * the sum of link.value for the node’s incoming links.
     */
    value: number;
    /**
     * Node's fixedValue (user-defined)
     */
    fixedValue: number;
    /**
     * Node’s zero-based index within the array of nodes calculated by Sankey layout generator.
     */
    index: number;
    /**
     * Node’s zero-based graph depth, derived from the graph topology calculated by Sankey layout generator.
     */
    depth: number;
    /**
     * Node’s zero-based graph height, derived from the graph topology calculated by Sankey layout generator.
     */
    height: number;
    /**
     * Node's minimum horizontal position (derived from the node.depth) calculated by Sankey layout generator.
     */
    x0: number;
    /**
     * Node’s maximum horizontal position (node.x0 + sankey.nodeWidth) calculated by Sankey layout generator.
     */
    x1: number;
    /**
     * Node's minimum vertical position calculated by Sankey layout generator.
     */
    y0: number;
    /**
     * Node's maximum vertical position (node.y1 - node.y0 is proportional to node.value) calculated by Sankey layout generator.
     */
    y1: number;
}>