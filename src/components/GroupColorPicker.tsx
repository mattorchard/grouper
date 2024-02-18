import { FC } from "preact/compat";
import { capitalizeFirst } from "../helpers/textHelpers";
import { groupColors } from "../types";
import useStableId from "../hooks/useStableId";
import ColorEnum = chrome.tabGroups.ColorEnum;

const GroupColorPicker: FC<{
  value: ColorEnum;
  onChange: (color: ColorEnum) => void;
}> = ({ value: selectedColor, onChange }) => {
  const id = useStableId();
  return (
    <div
      className="group-color-picker"
      onChange={(e) =>
        onChange((e.target as HTMLInputElement).value as ColorEnum)
      }
      role="radiogroup"
      aria-label="Group color picker"
    >
      {groupColors.map((color) => (
        <input
          aria-label={color}
          title={capitalizeFirst(color)}
          type="radio"
          value={color}
          checked={selectedColor === color}
          name={`group-color-picker-${id}`}
          className={`group-color-picker__input color-${color}`}
        >
          {color}
        </input>
      ))}
    </div>
  );
};

export default GroupColorPicker;
