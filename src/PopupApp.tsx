import "./globals.css";
import Button from "./components/Button";
import { executeGrouping, unGroupAllTabs } from "./helpers/extensionHelpers";
import RulesForm from "./components/RulesForm";
import OptionsForm from "./components/OptionsForm";
import useRulesRepository from "./hooks/useRulesRepository";

const PopupApp = () => {
  const rulesRepo = useRulesRepository();
  return (
    <div className="popup-app">
      <main className="main-actions">
        <Button onClick={executeGrouping}>Group</Button>
        <Button onClick={unGroupAllTabs}>Un-Group</Button>
      </main>
      <OptionsForm />
      <RulesForm repo={rulesRepo} />
    </div>
  );
};

const WrappedPopupApp = () => <PopupApp />;

export default WrappedPopupApp;
