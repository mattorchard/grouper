import { groupByCallback, groupByProperty } from "./utilities";
import { asUrl } from "./domHelpers";
import { decomposeTitle } from "./textHelpers";
import { loadOptions, loadRules } from "./repositoryHelpers";
import { GroupSpec, RuleEngine } from "./RuleEngine";

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

const createTabGroup = async (
  { title, color, collapsed }: chrome.tabGroups.UpdateProperties,
  tabs: Tab[]
) => {
  const windowId = tabs[0].windowId;
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
  return groupId;
};

interface CreatedGroupSpec extends GroupSpec {
  groupId: number;
}

const setGroupOrder = async (groups: CreatedGroupSpec[]) => {
  let index = 0;
  for (const group of groups) {
    await chrome.tabGroups.move(group.groupId, { index });
    index += group.tabs.length;
  }
};

export const executeGrouping = async () => {
  // Todo: Add feature to try and preserve existing groups
  await unGroupAllTabs();
  const options = await loadOptions();
  const engine = new RuleEngine(await loadRules(), options);

  const allTabs = (await chrome.tabs.query({})).map(enrichTab);

  const groupBoundaries = options.crossWindows
    ? [allTabs]
    : groupByProperty(allTabs, "windowId");

  await Promise.all(
    groupBoundaries.map(async (tabsInBoundary) => {
      const groupSpecs = engine.createGroupSpecs(tabsInBoundary);

      const createdGroupSpecs = await Promise.all(
        groupSpecs.map(async (groupSpec) => ({
          ...groupSpec,
          groupId: await createTabGroup(
            { ...groupSpec, collapsed: options.collapse },
            groupSpec.tabs
          ),
        }))
      );

      if (options.alphabetize) {
        const groupsByWindow = groupByCallback(
          createdGroupSpecs,
          (group) => group.tabs[0].windowId
        );

        await Promise.all(
          groupsByWindow.map(async (groupsInWindow) => {
            groupsInWindow.sort((a, b) => a.title.localeCompare(b.title));
            await setGroupOrder(groupsInWindow);
          })
        );
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
