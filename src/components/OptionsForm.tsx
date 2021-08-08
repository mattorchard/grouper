import Switch from "./Switch";
import { OptionsRepository } from "../hooks/useOptionsRepository";
import InfoPopover from "./InfoPopover";
import { FC, Fragment } from "preact/compat";
import { Options } from "../types";
import useStableId from "../hooks/useStableId";

const OptionSwitch: FC<{
  optionName: keyof Options;
  label: string;
  description: string;
  options: Options;
  setOption: OptionsRepository["setOption"];
}> = ({ optionName, label, description, options, setOption }) => {
  const descriptionId = useStableId();
  return (
    <div className="options__form__row">
      <Switch
        isChecked={options[optionName]}
        onChange={(isChecked) => setOption(optionName, isChecked)}
        label={label}
        describedBy={descriptionId}
      />
      <InfoPopover contentId={descriptionId}>{description}</InfoPopover>
    </div>
  );
};

const OptionsForm: FC<{
  repo: OptionsRepository;
  isAdvanced?: boolean;
}> = ({ repo, isAdvanced = false }) => {
  const { options, setOption } = repo;

  const alphabetizeDescriptionId = useStableId();
  const manualOrderDescriptionId = useStableId();

  return (
    <form className="options-form">
      <h2 className="options__header">Options</h2>
      <fieldset className="options__fieldset">
        <OptionSwitch
          optionName="autoRun"
          label="Auto Run"
          description="Groups tabs as soon as popup is opened."
          options={options}
          setOption={setOption}
        />
        <OptionSwitch
          optionName="autoGroup"
          label="Auto Group"
          description="Create groups from any tabs on the same site."
          options={options}
          setOption={setOption}
        />
        <OptionSwitch
          optionName="collapse"
          label="Collapse"
          description="Collapse groups after running."
          options={options}
          setOption={setOption}
        />

        <OptionSwitch
          optionName="preserveGroups"
          label="Preserve Groups"
          description="Ignores existing groups"
          options={options}
          setOption={setOption}
        />

        <OptionSwitch
          optionName="crossWindows"
          label="Cross Windows"
          description="Merge groups across windows."
          options={options}
          setOption={setOption}
        />

        {isAdvanced && (
          <Fragment>
            <div className="options__form__row">
              <Switch
                isChecked={options.alphabetize}
                onChange={(isChecked) => {
                  setOption("alphabetize", isChecked);
                  if (isChecked) setOption("manualOrder", false);
                }}
                label="Alphabetize"
                describedBy={alphabetizeDescriptionId}
              />
              <InfoPopover contentId={alphabetizeDescriptionId}>
                Place groups in alphabetical order by title.
              </InfoPopover>
            </div>

            <div className="options__form__row">
              <Switch
                isChecked={options.manualOrder}
                onChange={(isChecked) => {
                  setOption("manualOrder", isChecked);
                  if (isChecked) setOption("alphabetize", false);
                }}
                label="Manual order"
                describedBy={manualOrderDescriptionId}
              />
              <InfoPopover contentId={manualOrderDescriptionId}>
                Place groups in a user-specified order.
              </InfoPopover>
            </div>
          </Fragment>
        )}
      </fieldset>
    </form>
  );
};

export default OptionsForm;
