import { FC } from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import HTMLAttributes = JSXInternal.HTMLAttributes;

type ButtonProps = {} & HTMLAttributes<HTMLButtonElement>;
const Button: FC<ButtonProps> = ({
  className,
  children,
  type = "button",
  ...props
}) => (
  <button {...props} type={type} className={`${className} button`}>
    {children}
  </button>
);

export default Button;
