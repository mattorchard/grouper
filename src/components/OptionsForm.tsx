import Switch from "./Switch";
import useOptionsRepository from "../hooks/useOptionsRepository";

const OptionsForm = () => {
  const { options, setOption } = useOptionsRepository();

  return (
    <form className="options-form">
      <h2 className="options__header">Options</h2>
      <fieldset className="options__fieldset">
        <Switch
          isChecked={options.autoRun}
          onChange={(isChecked) => setOption("autoRun", isChecked)}
          label="Auto Run"
        />
        <Switch
          isChecked={options.autoGroup}
          onChange={(isChecked) => setOption("autoGroup", isChecked)}
          label="Auto Group"
        />
        <Switch
          isChecked={options.collapse}
          onChange={(isChecked) => setOption("collapse", isChecked)}
          label="Collapse"
        />
        <Switch
          isChecked={options.crossWindows}
          onChange={(isChecked) => setOption("crossWindows", isChecked)}
          label="Cross Windows"
        />
      </fieldset>
    </form>
  );
};

export default OptionsForm;
