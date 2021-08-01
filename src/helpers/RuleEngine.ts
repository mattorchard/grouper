import { GroupColor, Rule } from "../types";
import { EnrichedTab } from "./extensionHelpers";
import Tab = chrome.tabs.Tab;
import { strip } from "./textHelpers";

interface RuleEngineOptions {
  autoGroup: boolean;
}

export interface GroupSpec {
  title: string;
  color?: GroupColor;
  tabs: Tab[];
}

type RuleMatcher = (tab: EnrichedTab) => Rule | null;

export class RuleEngine {
  private readonly ruleMatchers: RuleMatcher[];
  private readonly autoGroup: boolean;

  constructor(rules: Rule[], { autoGroup }: RuleEngineOptions) {
    this.ruleMatchers = RuleEngine.createRuleMatchers(rules);
    this.autoGroup = autoGroup;
  }

  createGroupSpecs(tabs: EnrichedTab[]): GroupSpec[] {
    const explicitGroups = new Map<Rule["title"], GroupSpec>();
    const autoGroups = new Map<string | undefined, GroupSpec>();
    tabs.forEach((tab) => {
      const rule = this.findMatchingRule(tab);
      if (rule) {
        const groupKey = strip(rule.title);
        if (explicitGroups.has(groupKey)) {
          explicitGroups.get(groupKey)!.tabs.push(tab);
        } else {
          explicitGroups.set(groupKey, {
            title: groupKey,
            color: rule.color,
            tabs: [tab],
          });
        }
      } else if (this.autoGroup) {
        const groupKey = tab.urlObject?.hostname;
        if (autoGroups.has(groupKey)) {
          autoGroups.get(groupKey)!.tabs.push(tab);
        } else {
          autoGroups.set(groupKey, {
            title: groupKey ? tab.titleTrailer : "Other",
            tabs: [tab],
          });
        }
      }
    });
    return [...explicitGroups.values(), ...autoGroups.values()];
  }

  private findMatchingRule(tab: EnrichedTab) {
    for (const ruleMatcher of this.ruleMatchers) {
      const rule = ruleMatcher(tab);
      if (rule) return rule;
    }
    return null;
  }

  private static createRuleMatchers(rules: Rule[]): RuleMatcher[] {
    return rules.map((rule) => {
      const matchesClean = strip(rule.matches).toLowerCase();
      return (tab: EnrichedTab) => {
        if (
          tab.urlObject?.hostname.includes(matchesClean) ||
          tab.titleTrailer.includes(matchesClean)
        ) {
          return rule;
        }
        return null;
      };
    });
  }
}
