import { FC } from "preact/compat";

const errorReplacer = (key: string, value: any) => {
  if (value instanceof Error) {
    const { name, message, stack, ...rest } = value;
    return {
      REPLACED_ERROR: rest,
      name,
      message,
      stack,
    };
  }
  return value;
};

const DebugValue: FC<{ value: any }> = ({ value }) => (
  <code>
    <pre>{JSON.stringify(value, errorReplacer, 2)}</pre>
  </code>
);

export default DebugValue;
