export class MultiMap<KeyType, ValueType> {
  private readonly map: Map<KeyType, ValueType[]>;
  constructor() {
    this.map = new Map<KeyType, ValueType[]>();
  }

  set(key: KeyType, value: ValueType) {
    if (this.map.has(key)) {
      return this.map.get(key)!.push(value);
    }
    this.map.set(key, [value]);
    return 1;
  }

  values() {
    return this.map.values();
  }
}
