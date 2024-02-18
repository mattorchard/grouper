import { test, expect } from "./fixtures";

const exampleData = {
  names: ["alpha", "beta", "gamma", "delta"],
  tabCount: 50,
};

test("can handle a boat load of rules", async ({
  optionsPage,
  triggerPopup,
  bulkCreateTabs,
  dummyUrl,
  enableMemorySaver,
}) => {
  test.slow();
  await enableMemorySaver();

  const asGroupTitle = (name: string) => `Group of "${name}"`;
  for (const name of exampleData.names) {
    await optionsPage.addRule({ title: asGroupTitle(name), matches: name });
  }
  await bulkCreateTabs(
    exampleData.tabCount,
    exampleData.names.map((name) => dummyUrl(name)),
  );
  const expectedGroups = Object.fromEntries(
    exampleData.names.map((name) => [
      asGroupTitle(name),
      new Array(exampleData.tabCount).fill(dummyUrl(name)),
    ]),
  );
  const popupPage = await triggerPopup();
  expect(await popupPage.summarizeTabsByGroup()).toMatchObject(expectedGroups);

  await popupPage.triggerGroup();
  expect(await popupPage.summarizeTabsByGroup()).toMatchObject(expectedGroups);

  await popupPage.triggerGroup();
  expect(await popupPage.summarizeTabsByGroup()).toMatchObject(expectedGroups);

  await popupPage.triggerGroup();
  expect(await popupPage.summarizeTabsByGroup()).toMatchObject(expectedGroups);
});
