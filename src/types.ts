import ColorEnum = chrome.tabGroups.ColorEnum;

export const groupColors: readonly ColorEnum[] = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
];

export interface Rule {
  id: string;
  title: string;
  matches: string;
  color: ColorEnum;
}

export interface Options {
  autoRun: boolean;
  autoGroup: boolean;
  collapse: boolean;
  crossWindows: boolean;
  alphabetize: boolean;
  manualOrder: boolean;
  preserveGroups: boolean /** @deprecated */;
}

export const defaultOptions: Options = {
  autoRun: true,
  autoGroup: true,
  collapse: true,
  preserveGroups: false,
  crossWindows: false,
  alphabetize: false,
  manualOrder: false,
};
