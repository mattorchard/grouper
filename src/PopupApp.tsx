import "./globals.css";
import Button from "./components/Button";
import { executeGrouping, unGroupAllTabs } from "./helpers/extensionHelpers";
import RulesForm from "./components/RulesForm";
import OptionsForm from "./components/OptionsForm";

const PopupApp = () => {
  return (
    <div className="popup-app">
      <main className="main-actions">
        <Button onClick={executeGrouping}>Group</Button>
        <Button onClick={unGroupAllTabs}>Un-Group</Button>
      </main>
      <OptionsForm />
      <RulesForm />
    </div>
  );
};

const WrappedPopupApp = () => <PopupApp />;

export default WrappedPopupApp;
