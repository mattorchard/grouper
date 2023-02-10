import { executeGrouping } from "./helpers/extensionHelpers";

console.log("Registering command listener");
chrome.commands.onCommand.addListener(async (command) => {
  console.log(`Command "${command}" triggered`);
  switch (command) {
    case "group-tabs":
      await executeGrouping();
      break;
    default:
      console.warn("Unrecognized command", command);
  }
});
