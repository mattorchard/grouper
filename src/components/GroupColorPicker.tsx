import { useState } from "preact/hooks";
import { FC } from "preact/compat";
import { capitalizeFirst } from "../helpers/textHelpers";
import { GroupColor, groupColors } from "../types";

const generateId = () => Math.random().toString();

const GroupColorPicker: FC<{
  value: GroupColor;
  onChange: (color: GroupColor) => void;
}> = ({ value: selectedColor, onChange }) => {
  const [id] = useState(generateId);
  return (
    <div
      className="group-color-picker"
      onChange={(e) =>
        onChange((e.target as HTMLInputElement).value as GroupColor)
      }
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
