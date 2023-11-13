import "./globals.css";
import Button from "./components/Button";
import { executeGrouping, ungroupAllTabs } from "./helpers/extensionHelpers";
import RulesForm from "./components/RulesForm";
import OptionsForm from "./components/OptionsForm";
import useRulesRepository from "./hooks/useRulesRepository";
import useOptionsRepository from "./hooks/useOptionsRepository";
import { useState } from "preact/hooks";
import { wrapError } from "./helpers/errorHelpers";

const PopupApp = () => {
  const rulesRepo = useRulesRepository();
  const optionsRepo = useOptionsRepository();

  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="popup-app">
      <main className="main-actions">
        <Button
          onClick={async () => {
            try {
              setErrorMessage("");
              await executeGrouping();
            } catch (e) {
              const error = wrapError(e);
              console.error("Failed to execute grouping", error);
              setErrorMessage(error.message);
            }
          }}
        >
          Group
        </Button>
        <Button
          onClick={async () => {
            try {
              setErrorMessage("");
              await ungroupAllTabs();
            } catch (e) {
              const error = wrapError(e);
              console.error("Failed to execute grouping", error);
              setErrorMessage(error.message);
            }
          }}
        >
          Un-Group
        </Button>
      </main>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
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
