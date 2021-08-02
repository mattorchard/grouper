import "./globals.css";
import OptionsForm from "./components/OptionsForm";
import RulesForm from "./components/RulesForm";
import useCssPointerVars from "./hooks/useCssPointerVars";
import useRulesRepository from "./hooks/useRulesRepository";
import ReorderSection from "./components/ReorderSection";
import useOptionsRepository from "./hooks/useOptionsRepository";

const OptionsApp = () => {
  useCssPointerVars();
  const rulesRepo = useRulesRepository();
  const optionsRepo = useOptionsRepository();
  return (
    <div className="options__wrapper">
      <main className="options-main">
        <h1>Grouper</h1>
        <div className="options-body">
          {optionsRepo.options.manualOrder &&
            rulesRepo.rules &&
            rulesRepo.rules.length > 1 && <ReorderSection repo={rulesRepo} />}
          <OptionsForm repo={optionsRepo} />
          <RulesForm repo={rulesRepo} />
        </div>
      </main>
    </div>
  );
};

const WrappedOptionsApp = () => <OptionsApp />;

export default WrappedOptionsApp;
