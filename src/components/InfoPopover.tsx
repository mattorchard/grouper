import { FC, useRef } from "preact/compat";

const InfoPopover: FC<{ contentId?: string }> = ({ contentId, children }) => {
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
      <div className="info-popover__content" id={contentId}>
        {children}
      </div>
    </div>
  );
};

export default InfoPopover;
