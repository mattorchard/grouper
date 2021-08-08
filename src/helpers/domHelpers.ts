export const asUrl = (urlSpec: any) => {
  try {
    return new URL(urlSpec);
  } catch {
    return null;
  }
};

export const isAncestor = (
  potentialAncestor: HTMLElement,
  element: HTMLElement
) => {
  let currentElement: HTMLElement | null = element;
  while (currentElement) {
    if (currentElement === potentialAncestor) return true;
    currentElement = currentElement.parentElement;
  }
  return false;
};
