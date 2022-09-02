export interface Node {
  type: string;
  id: number;
  name: string;
}

export interface Link {
  type: string;
  id: string;
  color_id: number;
  source: string;
  target: string;
  value: number;
  real_value: number;
}

export enum NodeAlignment {
  Left = "Left",
  Right = "Right",
  Center = "Center",
  Justify = "Justify",
}

export enum NodeSortMethods {}

export enum ColoringMode {
  Categorical,
  Quantitative,
}
