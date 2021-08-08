export const strip = (text: string) => text.trimStart().trimEnd();

const separators = ["|", "-", "•", ",", "|", "–"];

const getTitleTrailer = (title: string): string => {
  let startIndex = 0;
  separators.forEach(
    (sep) => (startIndex = Math.max(title.lastIndexOf(sep) + 1, startIndex))
  );
  return strip(title.substring(startIndex));
};

export const decomposeTitle = (title: string) => strip(getTitleTrailer(title));

export const capitalizeFirst = (text: string) => {
  const first = text.substring(0, 1);
  const rest = text.substring(1);
  return first.toUpperCase() + rest;
};
