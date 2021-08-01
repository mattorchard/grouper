const lastAfter = (text: string, separator: string) => {
  const index = text.lastIndexOf(separator);
  return text.substring(index + 1);
};

export const strip = (text: string) => text.trimStart().trimEnd();

const getTitleTrailer = (title: string): string => {
  const hasBars = title.includes("|");
  const hasDashes = title.includes("-");
  if (hasBars && hasDashes) {
    return title.lastIndexOf("|") > title.lastIndexOf("-")
      ? lastAfter(title, "|")
      : lastAfter(title, "-");
  }
  if (hasBars) return lastAfter(title, "|");
  if (hasDashes) return lastAfter(title, "-");
  return title;
};

export const decomposeTitle = (title: string) => strip(getTitleTrailer(title));

export const capitalizeFirst = (text: string) => {
  const first = text.substring(0, 1);
  const rest = text.substring(1);
  return first.toUpperCase() + rest;
};
