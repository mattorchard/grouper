import RuleOrderer from "./RuleOrderer";
import { RulesRepository } from "../hooks/useRulesRepository";
import { FC } from "preact/compat";

const ReorderSection: FC<{ repo: RulesRepository }> = ({ repo }) => {
  return (
    <section className="reorder-section">
      <h2 className="reorder-section__header">Group Order</h2>
      <RuleOrderer rules={repo.rules || []} onOrderChange={repo.saveRules} />
    </section>
  );
};

export default ReorderSection;
