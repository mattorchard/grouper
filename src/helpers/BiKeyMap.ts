class BiKeyMap<PrimaryKeyType, SecondaryKeyType, ValueType> {
  private map: Map<PrimaryKeyType, Map<SecondaryKeyType, ValueType>>;
  constructor() {
    this.map = new Map();
  }

  set(
    primaryKey: PrimaryKeyType,
    secondaryKey: SecondaryKeyType,
    value: ValueType
  ) {
    if (this.map.has(primaryKey)) {
      this.map.get(primaryKey)!.set(secondaryKey, value);
    } else {
      const secondaryMap = new Map();
      secondaryMap.set(secondaryKey, value);
      this.map.set(primaryKey, secondaryMap);
    }
  }

  get(
    primaryKey: PrimaryKeyType,
    secondaryKey: SecondaryKeyType
  ): ValueType | undefined {
    return this.map.get(primaryKey)?.get(secondaryKey);
  }

  has(primaryKey: PrimaryKeyType, secondaryKey: SecondaryKeyType): boolean {
    return !!this.map.get(primaryKey)?.has(secondaryKey);
  }
}

export default BiKeyMap;
