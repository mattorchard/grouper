import { useEffect, useState } from "preact/hooks";
import { defaultOptions, Options } from "../types";
import { loadOptions, saveOptions } from "../helpers/repositoryHelpers";

interface OptionsRepository {
  options: Options;
  setOption: (optionKey: keyof Options, value: boolean) => void;
}

const useOptionsRepository = (): OptionsRepository => {
  const [options, setOptions] = useState<Options | null>(null);

  useEffect(() => {
    loadOptions().then(setOptions);
  }, []);

  useEffect(() => {
    if (options) saveOptions(options);
  }, [options]);

  const setOption = (optionKey: keyof Options, value: boolean) =>
    setOptions((options) =>
      options ? { ...options, [optionKey]: value } : null
    );

  return { options: options || defaultOptions, setOption };
};

export default useOptionsRepository;
