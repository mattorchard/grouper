import useWindowEvent from "./useWindowEvent";

const useCssPointerVars = () => {
  const handler = (event: PointerEvent) => {
    const style = document.body.style;
    style.setProperty("--client-x", event.clientX.toString());
    style.setProperty("--client-y", event.clientY.toString());
    style.setProperty("--move-x", event.movementX.toString());
    style.setProperty("--move-y", event.movementY.toString());
  };
  useWindowEvent("pointermove", handler);
  useWindowEvent("pointerdown", handler);
  useWindowEvent("pointerup", handler);
};
export default useCssPointerVars;
