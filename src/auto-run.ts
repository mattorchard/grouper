import { executeAutoRun } from "./helpers/extensionHelpers";

executeAutoRun().then((didRun) => {
  if (didRun) console.log("Auto-run complete");
});
