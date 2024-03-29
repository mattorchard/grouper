const separatorSet = new Set(["|", "-", "•", ",", "–"]);

export const decomposeTitle = (title: string): string => {
  let buffer = "";
  for (const char of title) {
    if (separatorSet.has(char)) buffer = "";
    else buffer += char;
  }
  return buffer.trim();
};

export function cleanText(text: string): string;
export function cleanText(text: string | undefined): string | undefined;
export function cleanText(text: string | undefined): string | undefined {
  return text?.trim().toLowerCase();
}

export const capitalizeFirst = (text: string) => {
  const first = text.substring(0, 1);
  const rest = text.substring(1);
  return first.toUpperCase() + rest;
};
