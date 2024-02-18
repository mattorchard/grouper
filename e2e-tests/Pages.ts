import { Locator, Page } from "@playwright/test";
import { AvailableOptions } from "../src/types";
type ColorEnum = chrome.tabGroups.ColorEnum;
type TabGroup = chrome.tabGroups.TabGroup;
type Tab = chrome.tabs.Tab;

class RulesForm {
  readonly form: Locator;
  constructor(readonly page: Page) {
    this.form = page.getByTestId("rules-form");
  }

  get title() {
    return this.form.getByLabel("Title").first();
  }

  get matches() {
    return this.form.getByLabel("Matches").first();
  }

  color(color: ColorEnum) {
    return this.form.getByRole("radio", { name: color, exact: true }).first();
  }

  get addRuleButton() {
    return this.page.getByRole("button", { name: "Add Rule" });
  }

  async waitForSave() {
    // Allows time for debounced rule save to apply
    await this.page.waitForTimeout(500);
  }

  async addRule({
    title,
    matches,
    color,
  }: { title?: string; matches?: string; color?: ColorEnum } = {}) {
    await this.addRuleButton.click();
    if (title) await this.title.fill(title);
    if (matches) await this.matches.fill(matches);
    if (color) await this.color(color).check();
    await this.waitForSave();
  }
}

class OptionsForm {
  readonly form: Locator;
  constructor(readonly page: Page) {
    this.form = page.getByTestId("options-form");
  }

  async setOption(optionName: string, shouldCheck: boolean) {
    const checkbox = this.form.getByRole("checkbox", {
      name: optionName,
      includeHidden: true,
    });
    const isChecked = await checkbox.isChecked();
    if (isChecked !== shouldCheck) {
      // We click on the visible label, instead of the invisible input
      await this.form.getByText(optionName, { exact: true }).click();
    }
  }

  async setOptions(options: AvailableOptions) {
    await this.setOption("Auto run", options.autoRun);
    await this.setOption("Auto group", options.autoGroup);
    await this.setOption("Collapse", options.collapse);
    await this.setOption("Cross windows", options.crossWindows);
    await this.setOption("Alphabetize", options.alphabetize);
    await this.setOption("Manual order", options.manualOrder);
  }
}

export class OptionsPage {
  readonly rulesForm: RulesForm;
  readonly optionsForm: OptionsForm;

  constructor(readonly page: Page) {
    this.rulesForm = new RulesForm(page);
    this.optionsForm = new OptionsForm(page);
  }

  async goto(baseURL: string | undefined) {
    if (!baseURL) throw new Error(`Missing baseURL`);
    await this.page.goto(`${baseURL}/options.html`);
  }

  get heading() {
    return this.page.locator("h1");
  }
}

export class PopupPage {
  readonly rulesForm: RulesForm;
  readonly optionsForm: OptionsForm;

  constructor(readonly page: Page) {
    this.rulesForm = new RulesForm(page);
    this.optionsForm = new OptionsForm(page);
  }

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
      const groupTitle = group.title ?? "";
      summary[groupTitle] = tabs.map((tab) => tab.title ?? tab.url ?? "");
    }
    return summary;
  }
}
