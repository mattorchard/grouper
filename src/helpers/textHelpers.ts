const separatorSet = new Set(["|", "-", "•", ",", "|", "–"]);

export const decomposeTitle = (title: string): string => {
  let startIndex = 0;
  for (const [index, char] of [...title].entries()) {
    if (separatorSet.has(char)) startIndex = index;
  }
  return title.substring(startIndex + 1).trim();
};

export const capitalizeFirst = (text: string) => {
  const first = text.substring(0, 1);
  const rest = text.substring(1);
  return first.toUpperCase() + rest;
};
