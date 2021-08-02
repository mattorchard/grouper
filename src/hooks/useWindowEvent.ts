import { useEffect } from "preact/hooks";

const useWindowEvent = <K extends keyof WindowEventMap>(
  eventName: K,
  listener: (event: WindowEventMap[K]) => void
) => {
  useEffect(() => {
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [eventName, listener]);
};

export default useWindowEvent;
