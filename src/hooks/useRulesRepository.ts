import { useEffect, useState } from "preact/hooks";
import { generateId } from "../helpers/entityHelpers";
import { loadRules, saveRules } from "../helpers/repositoryHelpers";
import { Rule } from "../types";

let saveRulesTid: number | null = null;
const saveRulesDebounced = (rules: Rule[]) => {
  if (saveRulesTid) clearTimeout(saveRulesTid);
  saveRulesTid = setTimeout(() => saveRules(rules), 250);
};

interface RulesRepository {
  rules: Rule[] | null;
  addRule: () => void;
  saveRule: (rule: Rule) => void;
  deleteRule: (ruleId: Rule["id"]) => void;
}

const useRulesRepository = (): RulesRepository => {
  const [rules, setRules] = useState<Rule[] | null>(null);

  useEffect(() => {
    loadRules().then((rules) => {
      setRules(rules);
    });
  }, []);

  useEffect(() => {
    if (rules) saveRulesDebounced(rules);
  }, [rules]);

  const addRule = () =>
    setRules((rules) => (rules ? [newRule(), ...rules] : null));
  const deleteRule = (ruleToDeleteId: string) =>
    setRules((rules) =>
      rules ? rules.filter((rule) => rule.id !== ruleToDeleteId) : null
    );

  const saveRule = (ruleToSave: Rule) =>
    setRules((rules) =>
      rules
        ? rules.map((rule) => (rule.id === ruleToSave.id ? ruleToSave : rule))
        : null
    );

  return { rules, addRule, deleteRule, saveRule };
};

const newRule = (): Rule => ({
  id: generateId(),
  title: "",
  matches: "",
  color: "grey",
});

export default useRulesRepository;
