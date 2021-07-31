export const asUrl = (urlSpec: any) => {
  try {
    return new URL(urlSpec);
  } catch {
    return null;
  }
};
