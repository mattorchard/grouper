import { FC } from "preact/compat";
import { useRef } from "preact/hooks";

const InfoPopover: FC = ({ children }) => {
  const buttonRef = useRef<HTMLButtonElement>(undefined!);
  return (
    <div className="info-popover" onClick={() => buttonRef.current!.focus()}>
      <button
        aria-label="info"
        className="info-popover__target"
        type="button"
        ref={buttonRef}
      >
        ?
      </button>
      <div className="info-popover__content">{children}</div>
    </div>
  );
};

export default InfoPopover;
