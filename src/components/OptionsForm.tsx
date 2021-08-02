import Switch from "./Switch";
import useOptionsRepository from "../hooks/useOptionsRepository";
import InfoPopover from "./InfoPopover";

const OptionsForm = () => {
  const { options, setOption } = useOptionsRepository();

  return (
    <form className="options-form">
      <h2 className="options__header">Options</h2>
      <fieldset className="options__fieldset">
        <div className="options__form__row">
          <Switch
            isChecked={options.autoRun}
            onChange={(isChecked) => setOption("autoRun", isChecked)}
            label="Auto Run"
          />
          <InfoPopover>Groups tabs as soon as popup is opened.</InfoPopover>
        </div>
        <div className="options__form__row">
          <Switch
            isChecked={options.autoGroup}
            onChange={(isChecked) => setOption("autoGroup", isChecked)}
            label="Auto Group"
          />
          <InfoPopover>
            Create groups from any tabs on the same site.
          </InfoPopover>
        </div>
        <div className="options__form__row">
          <Switch
            isChecked={options.collapse}
            onChange={(isChecked) => setOption("collapse", isChecked)}
            label="Collapse"
          />
          <InfoPopover>Collapse groups after running.</InfoPopover>
        </div>
        <div className="options__form__row">
          <Switch
            isChecked={options.crossWindows}
            onChange={(isChecked) => setOption("crossWindows", isChecked)}
            label="Cross Windows"
          />
          <InfoPopover>Merge groups across windows.</InfoPopover>
        </div>
      </fieldset>
    </form>
  );
};

export default OptionsForm;
