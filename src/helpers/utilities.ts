import { MultiMap } from "./MultiMap";

export const groupByProperty = <ItemType, PropertyType extends keyof ItemType>(
  items: ItemType[],
  propertyName: PropertyType
): ItemType[][] => {
  const map = new MultiMap<ItemType[PropertyType], ItemType>();
  items.forEach((item) => {
    const groupKey = item[propertyName];
    map.set(groupKey, item);
  });
  return [...map.values()];
};

export const groupByCallback = <ItemType, GroupKeyType>(
  items: ItemType[],
  callback: (item: ItemType) => GroupKeyType
): ItemType[][] => {
  const map = new MultiMap<GroupKeyType, ItemType>();
  items.forEach((item) => {
    const groupKey = callback(item);
    map.set(groupKey, item);
  });
  return [...map.values()];
};

export const filterSplit = <ItemType>(
  array: Array<ItemType>,
  predicate: (item: ItemType, index: number, array: Array<ItemType>) => any
) => {
  const result = { false: [] as ItemType[], true: [] as ItemType[] };
  array.forEach((item, index, array) =>
    predicate(item, index, array)
      ? result.true.push(item)
      : result.false.push(item)
  );
  return result;
};
