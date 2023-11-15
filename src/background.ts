import { RuleEngine } from "./helpers/RuleEngine";
import { executeGrouping, enrichTab } from "./helpers/extensionHelpers";
import {
  subscribeToOptions,
  subscribeToRules,
} from "./helpers/repositoryHelpers";
import { Options, Rule, passiveOptions } from "./types";

console.log("Registering command listener");
chrome.commands.onCommand.addListener(async (command) => {
  console.log(`Command "${command}" triggered`);
  switch (command) {
    case "group-tabs":
      await executeGrouping();
      break;
    default:
      console.warn("Unrecognized command", command);
  }
});

let rules = new Array<Rule>();
let options: Options = passiveOptions;
let ruleEngine = new RuleEngine(rules, options);

subscribeToRules((newRules) => {
  rules = newRules;
  ruleEngine = new RuleEngine(rules, options);
});
subscribeToOptions((newOptions) => {
  options = newOptions;
  ruleEngine = new RuleEngine(rules, options);
});

const fieldsToWatch = ["url", "title"] as const;
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!fieldsToWatch.some((field) => field in changeInfo)) return;

  const enrichedTab = enrichTab(tab);
  const rule = ruleEngine.findMatchingRule(enrichedTab);
  if (!rule) return console.log("No rule for tab");

  const allGroups = await chrome.tabGroups.query({});

  const intendedGroup = allGroups.find((g) => g.title === rule.title);
  if (!intendedGroup) return console.log("No existing group for rule");

  const actualGroup = allGroups.find((g) => g.id === enrichedTab.groupId);
  if (intendedGroup === actualGroup)
    return console.log("Already in correct group");

  await chrome.tabs.group({
    tabIds: [tabId],
    groupId: intendedGroup.id,
  });
});
