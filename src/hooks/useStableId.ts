import { generateId } from "../helpers/entityHelpers";
import { useState } from "preact/hooks";

const useStableId = (): string => {
  const [stableId] = useState(generateId);
  return stableId;
};

export default useStableId;
