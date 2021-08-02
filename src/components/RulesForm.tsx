import RuleFieldset from "./RuleFieldset";
import Button from "./Button";
import { RulesRepository } from "../hooks/useRulesRepository";
import { FC } from "preact/compat";

const RulesForm: FC<{ repo: RulesRepository }> = ({ repo }) => {
  const { rules, addRule, saveRule, deleteRule } = repo;

  return (
    <form className="rules-form">
      <div className="rules-form__header">
        <h2>Rules</h2>
        <Button onClick={addRule}>+ Add Rule</Button>
      </div>
      <div class="rule-list">
        {rules?.map((rule) => (
          <RuleFieldset
            key={rule.id}
            rule={rule}
            onChange={saveRule}
            onDelete={() => deleteRule(rule.id)}
          />
        ))}
        {rules?.length === 0 && (
          <p>Add rules to create groups with a certain title and color.</p>
        )}
      </div>
    </form>
  );
};

export default RulesForm;
