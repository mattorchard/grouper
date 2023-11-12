import { groupByProperty } from "./utilities";
import { asUrl } from "./domHelpers";
import { decomposeTitle } from "./textHelpers";
import { loadOptions, loadRules } from "./repositoryHelpers";
import { GroupSpec, RuleEngine } from "./RuleEngine";
import { groupColors, Rule } from "../types";
import BiKeyMap from "./BiKeyMap";

type Tab = chrome.tabs.Tab;
type TabGroup = chrome.tabGroups.TabGroup;
type TabGroupUpdate = chrome.tabGroups.UpdateProperties;

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

const isWithinTabGroup = (tab: Tab) =>
  tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE;

const getTabId = (tab: Tab) => tab.id!;

const getTabDebug = ({ id, title }: Tab) => ({ id, title });

export const ungroupAllTabs = async () => {
  const allTabs = await chrome.tabs.query({});
  await ungroupTabs(allTabs);
};

const ungroupTabs = async (tabs: Tab[]) => {
  const groupedTabIds = tabs.filter(isWithinTabGroup).map(getTabId);
  if (groupedTabIds.length > 0) {
    await chrome.tabs.ungroup(groupedTabIds);
  }
};

interface ConcreteGroupSpec extends GroupSpec {
  groupId: number;
}

const createTabGroup = async (
  groupSpec: GroupSpec,
  collapsed: boolean,
): Promise<ConcreteGroupSpec> => {
  const { title, color, tabs, windowId } = groupSpec;

  const groupId = await chrome.tabs.group({
    tabIds: tabs.map(getTabId),
    createProperties: { windowId },
  });

  await chrome.tabGroups.update(groupId, {
    collapsed: collapsed && !tabs.some((tab) => tab.active),
    title,
    color,
  });
  return { ...groupSpec, groupId: groupId };
};

const shouldUpdateGroupDetails = (
  existing: TabGroupUpdate,
  change: TabGroupUpdate,
) =>
  change.collapsed !== existing.collapsed ||
  change.title !== existing.title ||
  (change.color && change.color !== existing.color);

const updateTabGroup = async (
  existingGroup: TabGroup,
  groupSpec: GroupSpec,
  collapsed: boolean,
): Promise<ConcreteGroupSpec> => {
  const { title, color, tabs } = groupSpec;

  const tabsToRegroup = groupSpec.tabs.filter(
    (tab) => tab.groupId !== existingGroup.id,
  );
  if (tabsToRegroup.length > 0) {
    await chrome.tabs.group({
      groupId: existingGroup.id,
      tabIds: tabsToRegroup.map(getTabId),
    });
  }
  const groupPatch = {
    collapsed: collapsed && !tabs.some((tab) => tab.active),
    title,
    color,
  };
  if (shouldUpdateGroupDetails(existingGroup, groupPatch)) {
    await chrome.tabGroups.update(existingGroup.id, groupPatch);
  }
  return { ...groupSpec, groupId: existingGroup.id };
};

const setGroupOrder = async (
  groups: ReadonlyArray<ConcreteGroupSpec>,
  offset: number,
) => {
  for (const group of [...groups].reverse()) {
    await chrome.tabGroups.move(group.groupId, { index: offset });
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
  createdGroups: ConcreteGroupSpec[],
  comparator: GroupComparator,
  sortOffsetMap: ReadonlyMap<number, number>,
) => {
  const groupsByWindow = groupByProperty(createdGroups, "windowId");

  await Promise.all(
    groupsByWindow.map(async (groupsInWindow) => {
      groupsInWindow.sort(comparator);
      const [{ windowId }] = groupsInWindow;
      const offset = sortOffsetMap.get(windowId) ?? 0;
      await setGroupOrder(groupsInWindow, offset);
    }),
  );
};

// Assigns unused colors to uncoloured groups until all colours used
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
  try {
    console.time("executeGrouping");
    await executeGroupingInner();
    console.timeEnd("executeGrouping");
  } catch (error) {
    console.error(`Failed to group tabs`, error);
    throw error;
  }
};

export const executeGroupingInner = async () => {
  const rulesPromise = loadRules();
  const optionsPromise = loadOptions();
  const existingGroupsPromise = chrome.tabGroups.query({});

  const allTabs = (await chrome.tabs.query({})).map(enrichTab);
  const tabsToGroup = allTabs.filter((tab) => !tab.pinned);
  console.debug("Tabs to group", tabsToGroup);
  if (tabsToGroup.length === 0) return;

  const options = await optionsPromise;
  const groupBoundaries = options.crossWindows
    ? [tabsToGroup]
    : groupByProperty(tabsToGroup, "windowId");

  const rules = await rulesPromise;
  const engine = new RuleEngine(rules, options);
  const existingGroups = await existingGroupsPromise;
  const sortOffsetMap = countPinnedTabsPerWindow(allTabs);

  await Promise.all(
    groupBoundaries.map(async (tabsInBoundary) => {
      const groupSpecs = engine.createGroupSpecs(tabsInBoundary);
      groupByProperty(groupSpecs, "windowId").forEach(assignUnusedColors);

      console.debug("Group Specs", groupSpecs);
      const concreteGroups = await Promise.all(
        groupSpecs.map(async (groupSpec) => {
          const existingGroup = existingGroups.find(
            (existingGroup) =>
              existingGroup.title &&
              existingGroup.title === groupSpec.title &&
              (options.crossWindows ||
                existingGroup.windowId === groupSpec.windowId),
          );
          return existingGroup
            ? updateTabGroup(existingGroup, groupSpec, options.collapse)
            : createTabGroup(groupSpec, options.collapse);
        }),
      );

      if (options.manualOrder) {
        await sortGroupOrder(
          concreteGroups,
          createManualOrderComparator(rules),
          sortOffsetMap,
        );
      } else if (options.alphabetize) {
        await sortGroupOrder(
          concreteGroups,
          groupTitleComparator,
          sortOffsetMap,
        );
      }
    }),
  );
};

export const autoRunIfEnabled = async (): Promise<boolean> => {
  const { autoRun } = await loadOptions();
  if (!autoRun) return false;

  await executeGrouping();
  return true;
};

const countPinnedTabsPerWindow = (
  allTabs: EnrichedTab[],
): ReadonlyMap<number, number> => {
  const map = new Map();
  for (const tab of allTabs) {
    if (!tab.pinned) continue;
    const lastCount = map.get(tab.windowId) ?? 0;
    map.set(tab.windowId, lastCount + 1);
  }
  return map;
};
