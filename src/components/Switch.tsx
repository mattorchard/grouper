import { FC } from "preact/compat";

const Switch: FC<{
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  label: string;
  describedBy?: string;
}> = ({ isChecked, onChange, label, describedBy }) => (
  <label className={`switch switch--${isChecked && "is-checked"}`}>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={(e) => onChange(e.currentTarget.checked)}
      className="switch__input"
      aria-describedby={describedBy}
    />
    <div className="switch__track">
      <div className="switch__thumb" />
    </div>
    <span className="switch__label__inner">{label}</span>
  </label>
);

export default Switch;
