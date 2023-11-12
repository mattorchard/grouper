import { autoRunIfEnabled } from "./helpers/extensionHelpers";

autoRunIfEnabled()
  .then((didRun) => {
    if (didRun) console.log("Auto-run complete");
  })
  .catch((error) => {
    console.error("Failed to auto-run", error);
  });
