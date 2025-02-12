export enum MenuEvents {
  OPEN_DATA = "open-data",
  SNAPSHOT_WORKSPACE = "snapshot-workspace",
  ABOUT_WINDOW = "about-window",
}
export function groupby<TItem>(
  data: TItem[],
  fn: (item: TItem) => string,
  keys: any[] = []
): { [key: string]: TItem[] } {
  return data.reduce(
    (rv, item) => {
      (rv[fn(item)] = rv[fn(item)] || []).push(item);
      return rv;
    },
    keys.reduce((rv, item) => {
      rv[item.toString()] = [];
      return rv;
    }, {})
  );
}
