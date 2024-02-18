import { test, expect } from "./fixtures";

test.beforeEach(async ({ optionsPage, bulkCreateTabs, dummyUrl }) => {
  await optionsPage.rulesForm.addRule({
    title: "Alpha Group",
    matches: "alpha",
    color: "blue",
  });
  await optionsPage.rulesForm.addRule({
    title: "Beta Group",
    matches: "beta",
    color: "red",
  });
  await bulkCreateTabs(1, [
    dummyUrl("Alphabet Soup"),
    dummyUrl("Betamax Video"),
    dummyUrl("Cheerios - Wikipedia"),
    dummyUrl("VHS - Wikipedia"),
    dummyUrl("Beta Tester"),
    dummyUrl("Alpha Centauri"),
  ]);
});

test("autoRun=false does not trigger grouping until button pushed", async ({
  optionsPage,
  triggerPopup,
}) => {
  await optionsPage.optionsForm.setOptions({
    autoRun: false,
    autoGroup: false,
    collapse: false,
    crossWindows: false,
    alphabetize: false,
    manualOrder: false,
  });
  const popupPage = await triggerPopup();
  expect(await popupPage.summarizeTabsByGroup()).toStrictEqual({});

  await popupPage.triggerGroup();
  expect(await popupPage.summarizeTabsByGroup()).toStrictEqual({
    "Alpha Group": ["Alphabet Soup", "Alpha Centauri"],
    "Beta Group": ["Betamax Video", "Beta Tester"],
  });
});

test("autoRun=true triggers grouping immediately", async ({
  optionsPage,
  triggerPopup,
}) => {
  await optionsPage.optionsForm.setOptions({
    autoRun: true,
    autoGroup: false,
    collapse: false,
    crossWindows: false,
    alphabetize: false,
    manualOrder: false,
  });
  const popupPage = await triggerPopup();
  expect(await popupPage.summarizeTabsByGroup()).toStrictEqual({
    "Alpha Group": ["Alphabet Soup", "Alpha Centauri"],
    "Beta Group": ["Betamax Video", "Beta Tester"],
  });
});

test("autoGroup=true creates additional groups", async ({
  optionsPage,
  triggerPopup,
}) => {
  await optionsPage.optionsForm.setOptions({
    autoRun: true,
    autoGroup: true,
    collapse: false,
    crossWindows: false,
    alphabetize: false,
    manualOrder: false,
  });
  const popupPage = await triggerPopup();
  expect(await popupPage.summarizeTabsByGroup()).toMatchObject({
    "Alpha Group": ["Alphabet Soup", "Alpha Centauri"],
    "Beta Group": ["Betamax Video", "Beta Tester"],
    Wikipedia: ["Cheerios - Wikipedia", "VHS - Wikipedia"],
  });
});

test("collapse=true created collapsed groups", async ({
  optionsPage,
  triggerPopup,
}) => {
  await optionsPage.optionsForm.setOptions({
    autoRun: true,
    autoGroup: false,
    collapse: true,
    crossWindows: false,
    alphabetize: false,
    manualOrder: false,
  });
  const popupPage = await triggerPopup();
  const createdGroups = await popupPage.getTabGroups();
  expect(createdGroups).toStrictEqual([
    expect.objectContaining({ title: "Alpha Group", collapsed: true }),
    expect.objectContaining({ title: "Beta Group", collapsed: true }),
  ]);
});

test("manualOrder=true forces the specified order", async ({
  optionsPage,
  triggerPopup,
}) => {
  await optionsPage.optionsForm.setOptions({
    autoRun: true,
    autoGroup: false,
    collapse: false,
    crossWindows: false,
    alphabetize: false,
    manualOrder: true,
  });
  const popupPage = await triggerPopup();
  expect(await popupPage.summarizeTabsByGroup()).toStrictEqual({
    "Beta Group": ["Betamax Video", "Beta Tester"],
    "Alpha Group": ["Alphabet Soup", "Alpha Centauri"],
  });
});
