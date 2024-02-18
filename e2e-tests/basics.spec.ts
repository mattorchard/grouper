import { test, expect } from "./fixtures";

const exampleData = {
  rule: {
    title: "Example Tab Group!",
    matches: "example.com",
    color: "blue" as const,
  },
  url: "https://www.example.com/",
  tabCount: 3,
};

test("can load options page", async ({ optionsPage }) => {
  await expect(optionsPage.heading).toHaveText("Grouper");
});

test("can add an empty rule", async ({ optionsPage }) => {
  await optionsPage.rulesForm.addRule();
  await expect(optionsPage.page.getByTestId("rule-fieldset")).toBeDefined();
});

test("added rules can create groups", async ({
  optionsPage,
  triggerPopup,
  bulkCreateTabs,
}) => {
  await optionsPage.rulesForm.addRule(exampleData.rule);
  await bulkCreateTabs(exampleData.tabCount, [exampleData.url]);
  const popupPage = await triggerPopup();
  expect(await popupPage.summarizeTabsByGroup()).toMatchObject({
    [exampleData.rule.title]: new Array(exampleData.tabCount).fill(
      exampleData.url,
    ),
  });
});

test("can manipulate options", async ({ optionsPage }) => {
  await optionsPage.optionsForm.setOptions({
    autoRun: false,
    autoGroup: false,
    collapse: false,
    crossWindows: false,
    alphabetize: false,
    manualOrder: false,
  });
  await expect(
    optionsPage.optionsForm.form.getByRole("checkbox", {
      checked: false,
    }),
  ).toHaveCount(6);

  await optionsPage.optionsForm.setOptions({
    autoRun: true,
    autoGroup: true,
    collapse: true,
    crossWindows: true,
    alphabetize: true,
    manualOrder: true,
  });
  await expect(
    optionsPage.optionsForm.form.getByRole("checkbox", {
      checked: true,
    }),
  ).toHaveCount(5); // Order options are mutually exclusive
});
