import { executeGrouping, unGroupAllTabs } from "./helpers/extensionHelpers";

console.log("Registering command listener");
chrome.commands.onCommand.addListener(async (command) => {
  console.log(`Command "${command}" triggered`);
  switch (command) {
    case "group-tabs":
      await executeGrouping();
      break;
    case "ungroup-tabs":
      await unGroupAllTabs();
      break;
    default:
      console.warn("Unrecognized command", command);
  }
});
