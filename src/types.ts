export const groupColors = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
] as const;
export type GroupColor = typeof groupColors[number];

export interface Rule {
  id: string;
  title: string;
  matches: string;
  color: GroupColor;
}

export interface Options {
  autoRun: boolean;
  autoGroup: boolean;
  collapse: boolean;
  crossWindows: boolean;
}

export const defaultOptions = {
  autoRun: true,
  autoGroup: true,
  collapse: true,
  crossWindows: false,
};
