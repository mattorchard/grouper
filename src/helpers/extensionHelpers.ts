import { groupByProperty } from "./utilities";
import { asUrl } from "./domHelpers";
import { decomposeTitle } from "./textHelpers";
import { loadOptions, loadRules } from "./repositoryHelpers";
import { GroupSpec, RuleEngine } from "./RuleEngine";
import { groupColors, Rule } from "../types";
import BiKeyMap from "./BiKeyMap";

type Tab = chrome.tabs.Tab;

export interface EnrichedTab extends Tab {
  id: number;
  urlObject: URL | null;
  titleTrailer: string;
}

const enrichTab = (tab: Tab): EnrichedTab => ({
  ...tab,
  id: tab.id!,
  urlObject: asUrl(tab.url),
  titleTrailer: tab.title ? decomposeTitle(tab.title) : "",
});

const isWithinTabGroup = (tab: Tab) => tab.groupId !== -1;
const getTabId = (tab: Tab) => tab.id!;

export const unGroupAllTabs = async () => {
  const allTabs = await chrome.tabs.query({});
  const groupedTabIds = allTabs.filter(isWithinTabGroup).map(getTabId);
  if (groupedTabIds.length > 0) {
    await chrome.tabs.ungroup(groupedTabIds);
  }
};

interface CreatedGroupSpec extends GroupSpec {
  groupId: number;
}
const createTabGroup = async (
  groupSpec: GroupSpec,
  collapsed: boolean
): Promise<CreatedGroupSpec> => {
  const { title, color, tabs, windowId } = groupSpec;
  const tabIds = tabs.map(getTabId);
  const groupId = await chrome.tabs.group({
    tabIds,
    createProperties: { windowId },
  });
  const hasActiveTab = tabs.some((tab) => tab.active);
  await chrome.tabGroups.update(groupId, {
    collapsed: collapsed && !hasActiveTab,
    title,
    color,
  });
  return { ...groupSpec, groupId };
};

const setGroupOrder = async (groups: CreatedGroupSpec[]) => {
  let index = 0;
  for (const group of groups) {
    await chrome.tabGroups.move(group.groupId, { index });
    index += group.tabs.length;
  }
};

type GroupComparator = (a: GroupSpec, b: GroupSpec) => number;

const groupTitleComparator: GroupComparator = (a: GroupSpec, b: GroupSpec) =>
  a.title.localeCompare(b.title);

const createManualOrderComparator = (rules: Rule[]): GroupComparator => {
  const indexMap = new BiKeyMap<string, string | undefined, number>();
  rules.forEach((rule, index) => indexMap.set(rule.title, rule.color, index));

  return (a: GroupSpec, b: GroupSpec) => {
    const hasA = indexMap.has(a.title, a.color);
    const hasB = indexMap.has(b.title, b.color);
    if (hasA && hasB)
      return indexMap.get(a.title, a.color)! - indexMap.get(b.title, b.color)!;

    if (hasA) return -1;
    if (hasB) return 1;
    return 0;
  };
};

const sortGroupOrder = async (
  createdGroups: CreatedGroupSpec[],
  comparator: GroupComparator
) => {
  const groupsByWindow = groupByProperty(createdGroups, "windowId");

  await Promise.all(
    groupsByWindow.map(async (groupsInWindow) => {
      groupsInWindow.sort(comparator);
      await setGroupOrder(groupsInWindow);
    })
  );
};

const assignUnusedColors = (groupSpecs: GroupSpec[]) => {
  const unusedColors = new Set(groupColors);
  const groupsWithoutColor: GroupSpec[] = [];
  groupSpecs.forEach((group) => {
    if (group.color) unusedColors.delete(group.color);
    else groupsWithoutColor.push(group);
  });
  const availableColors = [...unusedColors].reverse();
  groupsWithoutColor
    .slice(0, availableColors.length)
    .forEach((group, index) => {
      group.color = availableColors[index];
    });
};

export const executeGrouping = async () => {
  // Todo: Add feature to try and preserve existing groups
  await unGroupAllTabs();

  const options = await loadOptions();
  const rules = await loadRules();
  const engine = new RuleEngine(rules, options);

  const allTabs = (await chrome.tabs.query({})).map(enrichTab);
  const groupBoundaries = options.crossWindows
    ? [allTabs]
    : groupByProperty(allTabs, "windowId");

  await Promise.all(
    groupBoundaries.map(async (tabsInBoundary) => {
      const groupSpecs = engine.createGroupSpecs(tabsInBoundary);

      groupByProperty(groupSpecs, "windowId").forEach(assignUnusedColors);

      const createdGroups = await Promise.all(
        groupSpecs.map((groupSpec) =>
          createTabGroup(groupSpec, options.collapse)
        )
      );

      if (options.manualOrder) {
        await sortGroupOrder(createdGroups, createManualOrderComparator(rules));
      } else if (options.alphabetize) {
        await sortGroupOrder(createdGroups, groupTitleComparator);
      }
    })
  );
};

export const executeAutoRun = async (): Promise<boolean> => {
  const { autoRun } = await loadOptions();
  if (!autoRun) return false;
  const tabs = await chrome.tabs.query({});
  if (!tabs.some((tab) => !isWithinTabGroup(tab))) return false;
  await executeGrouping();
  return true;
};
