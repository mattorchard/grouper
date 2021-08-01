import { useEffect, useState } from "preact/hooks";

interface AsyncState<ValueType> {
  error: Error | null;
  value: ValueType | null;
  isLoading: boolean;
}

const noCleanup = () => {};

const useAsyncValue = <ValueType>(
  asyncCallback: null | undefined | (() => Promise<ValueType>),
  deps: Array<any>
) => {
  const [state, setState] = useState<AsyncState<ValueType>>({
    error: null,
    value: null,
    isLoading: !!asyncCallback,
  });
  useEffect(() => {
    if (!asyncCallback) return noCleanup;

    setState((s) => ({ ...s, isLoading: true }));
    let isCancelled = false;

    asyncCallback()
      .then(
        (value) =>
          isCancelled || setState({ value, error: null, isLoading: false })
      )
      .catch((error) => {
        if (isCancelled) {
          console.warn(
            "Error in async value callback (after cancelling)",
            error
          );
        } else {
          console.error("Error in async value callback", error);
          setState({ error, value: null, isLoading: false });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, deps);
  return state;
};

export default useAsyncValue;
