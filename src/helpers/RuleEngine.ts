import { Rule } from "../types";
import { EnrichedTab } from "./extensionHelpers";
import { cleanText } from "./textHelpers";
import { notNullish } from "./utilities";
import Tab = chrome.tabs.Tab;
import ColorEnum = chrome.tabGroups.ColorEnum;

interface RuleEngineOptions {
  autoGroup: boolean;
}

export interface GroupSpec {
  title: string;
  tabs: Tab[];
  windowId: number;
  color?: ColorEnum;
}

type RuleCheck = {
  rule: Rule;
  test: (tab: EnrichedTab) => boolean;
};

export class RuleEngine {
  private readonly ruleChecks: RuleCheck[];
  private readonly autoGroup: boolean;

  constructor(rules: Rule[], { autoGroup }: RuleEngineOptions) {
    this.ruleChecks = RuleEngine.createRuleChecks(rules);
    this.autoGroup = autoGroup;
  }

  public createGroupSpecs(tabs: EnrichedTab[]): GroupSpec[] {
    const explicitGroups = new Map<string, GroupSpec>();
    const autoGroups = new Map<string | undefined, GroupSpec>();

    tabs.forEach((tab) => {
      const rule = this.findMatchingRule(tab);
      if (rule) {
        const groupKey = cleanText(rule.title);
        if (explicitGroups.has(groupKey)) {
          explicitGroups.get(groupKey)!.tabs.push(tab);
        } else {
          explicitGroups.set(groupKey, {
            title: rule.title,
            color: rule.color,
            tabs: [tab],
            windowId: tab.windowId,
          });
        }
      } else if (this.autoGroup) {
        const groupKey = tab.urlObject?.hostname;
        if (autoGroups.has(groupKey)) {
          autoGroups.get(groupKey)!.tabs.push(tab);
        } else {
          autoGroups.set(groupKey, {
            title: tab.titleTrailer || "Other",
            tabs: [tab],
            windowId: tab.windowId,
          });
        }
      }
    });
    return [...explicitGroups.values(), ...autoGroups.values()];
  }

  private findMatchingRule(tab: EnrichedTab) {
    for (const { rule, test } of this.ruleChecks) {
      const isMatch = test(tab);
      if (isMatch) return rule;
    }
    return null;
  }

  private static createRuleChecks(rules: Rule[]): RuleCheck[] {
    return rules
      .map((rule): RuleCheck | undefined => {
        const searchTokens = rule.matches
          .split(",")
          .map((token) => cleanText(token))
          .filter(Boolean);

        if (searchTokens.length === 0) return;

        return {
          rule,
          test: (tab: EnrichedTab): boolean =>
            searchTokens.some(
              (token) =>
                cleanText(tab.urlObject?.hostname)?.includes(token) ||
                cleanText(tab.titleTrailer).includes(token),
            ),
        };
      })
      .filter(notNullish);
  }
}
