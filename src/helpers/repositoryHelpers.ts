import { defaultOptions, Options, Rule } from "../types";

const getSyncedStorage = <T>(key: string): Promise<T | null | undefined> =>
  new Promise((resolve) =>
    chrome.storage.sync.get([key], (data) => resolve(data?.[key]))
  );

const setSyncedStorage = async (key: string, value: any): Promise<void> =>
  new Promise((resolve) => chrome.storage.sync.set({ [key]: value }, resolve));

export const saveRules = async (rules: Rule[]): Promise<void> => {
  console.debug("Saving rules", rules);
  await setSyncedStorage("rules", rules);
};

export const loadRules = async (): Promise<Rule[]> =>
  (await getSyncedStorage<Rule[]>("rules")) || [];

export const saveOptions = async (options: Options): Promise<void> => {
  console.debug("Saving options", options);
  await setSyncedStorage("options", options);
};

export const loadOptions = async (): Promise<Options> => ({
  ...defaultOptions,
  ...(await getSyncedStorage<Options>("options")),
});
