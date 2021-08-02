import "./globals.css";
import Button from "./components/Button";
import { executeGrouping, unGroupAllTabs } from "./helpers/extensionHelpers";
import RulesForm from "./components/RulesForm";
import OptionsForm from "./components/OptionsForm";
import useRulesRepository from "./hooks/useRulesRepository";
import useOptionsRepository from "./hooks/useOptionsRepository";

const PopupApp = () => {
  const rulesRepo = useRulesRepository();
  const optionsRepo = useOptionsRepository();
  return (
    <div className="popup-app">
      <main className="main-actions">
        <Button onClick={executeGrouping}>Group</Button>
        <Button onClick={unGroupAllTabs}>Un-Group</Button>
      </main>
      <section>
        <OptionsForm repo={optionsRepo} />
        <div className="options__footer">
          <a href="/options.html" target="_blank">
            Full options
          </a>
        </div>
      </section>
      <section>
        <RulesForm repo={rulesRepo} />
      </section>
    </div>
  );
};

const WrappedPopupApp = () => <PopupApp />;

export default WrappedPopupApp;
