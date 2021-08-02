import "./globals.css";
import OptionsForm from "./components/OptionsForm";
import RulesForm from "./components/RulesForm";
import useCssPointerVars from "./hooks/useCssPointerVars";
import useRulesRepository from "./hooks/useRulesRepository";
import ReorderSection from "./components/ReorderSection";

const OptionsApp = () => {
  useCssPointerVars();
  const rulesRepo = useRulesRepository();
  return (
    <div className="options__wrapper">
      <main className="options-main">
        <h1>Grouper</h1>
        <div className="options-body">
          {rulesRepo.rules && rulesRepo.rules.length > 1 && (
            <ReorderSection repo={rulesRepo} />
          )}
          <OptionsForm />
          <RulesForm repo={rulesRepo} />
        </div>
      </main>
    </div>
  );
};

const WrappedOptionsApp = () => <OptionsApp />;

export default WrappedOptionsApp;
