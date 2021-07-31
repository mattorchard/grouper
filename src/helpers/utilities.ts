export const groupByProperty = <ItemType, PropertyType extends keyof ItemType>(
  items: ItemType[],
  propertyName: PropertyType
) => {
  const map = new Map<ItemType[PropertyType], ItemType[]>();
  items.forEach((item) => {
    const groupKey = item[propertyName];
    if (map.has(groupKey)) {
      map.get(groupKey)!.push(item);
    } else {
      map.set(groupKey, [item]);
    }
  });
  return map;
};

export const groupByCallback = <ItemType, GroupKeyType>(
  items: ItemType[],
  callback: (item: ItemType) => GroupKeyType
) => {
  const map = new Map<GroupKeyType, ItemType[]>();
  items.forEach((item) => {
    const groupKey = callback(item);
    if (map.has(groupKey)) {
      map.get(groupKey)!.push(item);
    } else {
      map.set(groupKey, [item]);
    }
  });
  return map;
};
