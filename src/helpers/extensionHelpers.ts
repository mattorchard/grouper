import { groupByCallback, groupByProperty } from "./utilities";
import { asUrl } from "./domHelpers";
import { decomposeTitle } from "./textHelpers";

type Tab = chrome.tabs.Tab;

interface EnrichedTab extends Tab {
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
  groupProperties: chrome.tabGroups.UpdateProperties,
  tabs: Tab[]
) => {
  const windowId = tabs[0].windowId;
  const tabIds = tabs.map(getTabId);
  const groupId = await chrome.tabs.group({
    tabIds,
    createProperties: { windowId },
  });
  const collapsed = !tabs.some((tab) => tab.active);
  await chrome.tabGroups.update(groupId, { collapsed, ...groupProperties });
  return groupId;
};

export const naiveGroup = async () => {
  await unGroupAllTabs();

  const allTabs = (await chrome.tabs.query({})).map(enrichTab);
  const windowGroups = groupByProperty(allTabs, "windowId");

  const groupCreationPromises: Promise<number>[] = [];

  windowGroups.forEach((tabsInWindow) => {
    const tabsByHost = groupByCallback(
      tabsInWindow,
      (tab) => tab.urlObject?.hostname
    );
    tabsByHost.forEach((tabsToGroup) => {
      groupCreationPromises.push(
        createTabGroup(
          {
            title: tabsToGroup[0].titleTrailer,
          },
          tabsToGroup
        )
      );
    });
  });

  await Promise.all(groupCreationPromises);
};
