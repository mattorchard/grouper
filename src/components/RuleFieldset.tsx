import { FC } from "preact/compat";
import GroupColorPicker from "./GroupColorPicker";
import { Rule } from "../types";

interface RuleFieldsetProps {
  rule: Rule;
  onChange: (rule: Rule) => void;
  onDelete: () => void;
}

const RuleFieldset: FC<RuleFieldsetProps> = ({ rule, onChange, onDelete }) => (
  <fieldset className="rule-fieldset panel" data-testid="rule-fieldset">
    <div>
      <button
        type="button"
        className="delete-button"
        title={`Delete rule with title ${rule.title ?? "(blank)"}`}
        onClick={() => onDelete()}
      >
        <span aria-hidden="true">&times;</span>
      </button>
      <label className="text-label">
        Title
        <input
          type="text"
          placeholder="ex. Spotify"
          value={rule.title}
          onInput={(e) => onChange({ ...rule, title: e.currentTarget.value })}
        />
      </label>
      <label className="text-label">
        Matches
        <input
          type="text"
          placeholder="ex. spotify.com"
          value={rule.matches}
          onInput={(e) => onChange({ ...rule, matches: e.currentTarget.value })}
        />
      </label>

      <GroupColorPicker
        value={rule.color}
        onChange={(color) => onChange({ ...rule, color })}
      />
    </div>
  </fieldset>
);

export default RuleFieldset;
