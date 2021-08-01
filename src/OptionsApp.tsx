import "./globals.css";
import OptionsForm from "./components/OptionsForm";
import RulesForm from "./components/RulesForm";

const OptionsApp = () => {
  return (
    <div className="options__wrapper">
      <main className="options-main">
        <h1>Grouper</h1>
        <div className="options-body">
          <OptionsForm />
          <RulesForm />
        </div>
      </main>
    </div>
  );
};

const WrappedOptionsApp = () => <OptionsApp />;

export default WrappedOptionsApp;
