import DebugValue from "./DebugValue";
import useAsyncValue from "../hooks/useAsyncValue";

const TabDebugInfo = () => {
  const { value: tabGroups } = useAsyncValue(
    async () => chrome.tabGroups.query({}),
    []
  );
  const { value: tabs } = useAsyncValue(async () => chrome.tabs.query({}), []);
  return (
    <div>
      <details>
        <summary>Tab Group Info</summary>
        <DebugValue value={tabGroups} />
      </details>
      <details>
        <summary>Tab Info</summary>
        <DebugValue value={tabs} />
      </details>
    </div>
  );
};

export default TabDebugInfo;
