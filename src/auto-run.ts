import { autoRunIfEnabled } from "./helpers/extensionHelpers";

autoRunIfEnabled().then((didRun) => {
  if (didRun) console.log("Auto-run complete");
});
