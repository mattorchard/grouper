import { test, expect } from "./fixtures";

const exampleData = {
  rule: { title: "Example Tab Group!", matches: "example.com" },
  url: "https://www.example.com/",
  tabCount: 3,
};

test("can load options page", async ({ optionsPage }) => {
  await expect(optionsPage.heading).toHaveText("Grouper");
});

test("can add an empty rule", async ({ optionsPage }) => {
  await optionsPage.addRule();
  await expect(optionsPage.page.getByTestId("rule-fieldset")).toBeDefined();
});

test("added rules can create groups", async ({
  optionsPage,
  triggerPopup,
  bulkCreateTabs,
}) => {
  await optionsPage.addRule(exampleData.rule);
  await bulkCreateTabs(exampleData.tabCount, [exampleData.url]);
  const popupPage = await triggerPopup();
  expect(await popupPage.summarizeTabsByGroup()).toMatchObject({
    [exampleData.rule.title]: new Array(exampleData.tabCount).fill(
      exampleData.url,
    ),
  });
});
