import { naiveGroup } from "./helpers/extensionHelpers";

const autoGroup = async () => {
  await naiveGroup();
  window.close();
};
autoGroup();
