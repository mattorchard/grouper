import { Page } from "@playwright/test";

class BasePage {
  constructor(public readonly page: Page) {}

  get title() {
    return this.page.getByLabel("Title").first();
  }

  get matches() {
    return this.page.getByLabel("Matches").first();
  }

  get addRuleButton() {
    return this.page.getByRole("button", { name: "Add Rule" });
  }

  async waitForSave() {
    await this.page.waitForTimeout(1_000);
  }

  async addRule({ title, matches }: { title?: string; matches?: string } = {}) {
    await this.addRuleButton.click();
    if (title) await this.title.fill(title);
    if (matches) await this.matches.fill(matches);
    await this.waitForSave();
  }
}

export class OptionsPage extends BasePage {
  async goto(baseURL: string | undefined) {
    if (!baseURL) throw new Error(`Missing baseURL`);
    await this.page.goto(`${baseURL}/options.html`);
  }

  get heading() {
    return this.page.locator("h1");
  }
}

type TabGroup = chrome.tabGroups.TabGroup;
type Tab = chrome.tabs.Tab;

export class PopupPage extends BasePage {
  async goto(baseURL: string | undefined) {
    if (!baseURL) throw new Error(`Missing baseURL`);
    await this.page.goto(`${baseURL}/popup.html`);
  }

  async triggerGroup() {
    await this.page.getByText("Group", { exact: true }).click();
  }

  async getTabGroups(): Promise<TabGroup[]> {
    return this.page.evaluate(() => chrome.tabGroups.query({}));
  }

  async getTabs(): Promise<Tab[]> {
    return this.page.evaluate(() => chrome.tabs.query({}));
  }

  async getTabsByGroup() {
    const [tabs, groups] = await Promise.all([
      this.getTabs(),
      this.getTabGroups(),
    ]);

    const output = groups.map((group) => ({ group, tabs: new Array<Tab>() }));
    for (const tab of tabs) {
      const group = output.find(({ group }) => group.id === tab.groupId);
      if (group) group.tabs.push(tab);
    }
    return output;
  }

  async summarizeTabsByGroup() {
    const summary: Record<string, string[]> = {};
    for (const { group, tabs } of await this.getTabsByGroup()) {
      const title = group.title ?? "";
      summary[title] = tabs.map((tab) => tab.url ?? "");
    }
    return summary;
  }
}
