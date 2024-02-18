import {
  test as base,
  chromium,
  type BrowserContext,
  Page,
} from "@playwright/test";
import path from "path";
import fs from "fs/promises";
import { OptionsPage, PopupPage } from "./Pages";
import { v4 as createId } from "uuid";

const asPath = (...parts: string[]) => path.join(__dirname, "..", ...parts);

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  optionsPage: OptionsPage;
  triggerPopup: () => Promise<PopupPage>;
  bulkCreateTabs: (count: number, urls: string[]) => Promise<Page[]>;
  dummyUrl: (desiredTitle: string) => string;
}>({
  context: async ({}, use) => {
    const runId = createId();
    const pathToExtension = asPath("dist");
    const pathToUserData = asPath("user-data-dir", runId.toString());
    const context = await chromium.launchPersistentContext(pathToUserData, {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await enableMemorySaver(context);
    await use(context);
    await context.close();
    await fs.rm(pathToUserData, { recursive: true, force: true });
  },

  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent("serviceworker");

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },

  baseURL: async ({ extensionId }, use) => {
    await use(`chrome-extension://${extensionId}`);
  },

  optionsPage: async ({ page, baseURL }, use) => {
    const optionsPage = new OptionsPage(page);
    await optionsPage.goto(baseURL);
    use(optionsPage);
  },

  triggerPopup: ({ context, baseURL }, use) => {
    use(async (): Promise<PopupPage> => {
      const freshPage = await context.newPage();
      const popupPage = new PopupPage(freshPage);
      await popupPage.goto(baseURL);
      return popupPage;
    });
  },

  bulkCreateTabs: ({ context }, use) => {
    use(async (count, urls): Promise<Page[]> => {
      const promises = new Array<Promise<Page>>();
      for (const url of urls) {
        for (let index = 0; index < count; index++) {
          promises.push(
            Promise.resolve().then(async () => {
              const page = await context.newPage();
              await page.goto(url);
              return page;
            }),
          );
          if (index % 100 === 0) await Promise.all(promises);
        }
      }
      return Promise.all(promises);
    });
  },

  dummyUrl: ({}, use) => {
    use((desiredTitle) => `http://127.0.0.1:3000/?title=${desiredTitle}`);
  },
});

const enableMemorySaver = async (context: BrowserContext) => {
  const settingName = `Memory Saver`;

  const settingsPage = await context.newPage();
  await settingsPage.goto(`chrome://settings/?search=${settingName}`);

  const toggle = await settingsPage.getByLabel(settingName);
  const ariaPressed = await toggle.getAttribute("aria-pressed");

  if (ariaPressed !== "true") await toggle.click();
  await settingsPage.close();
};

export const expect = test.expect;
