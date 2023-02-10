import Switch from "./Switch";
import { OptionsRepository } from "../hooks/useOptionsRepository";
import InfoPopover from "./InfoPopover";
import { FC, Fragment } from "preact/compat";
import { Options } from "../types";
import useStableId from "../hooks/useStableId";

const OptionsForm: FC<{
  repo: OptionsRepository;
  isAdvanced?: boolean;
}> = ({ repo, isAdvanced = false }) => {
  const { options, setOption } = repo;

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
            <OptionSwitch
              optionName="alphabetize"
              label="Alphabetize"
              description="Place groups in alphabetical order by title."
              onChange={(isChecked) => {
                if (isChecked) setOption("manualOrder", false);
              }}
              options={options}
              setOption={setOption}
            />

            <OptionSwitch
              optionName="manualOrder"
              label="Manual order"
              description="Place groups in a user-specified order."
              onChange={(isChecked) => {
                if (isChecked) setOption("alphabetize", false);
              }}
              options={options}
              setOption={setOption}
            />
          </Fragment>
        )}
      </fieldset>
    </form>
  );
};

const OptionSwitch: FC<{
  optionName: keyof Options;
  label: string;
  description: string;
  options: Options;
  setOption: OptionsRepository["setOption"];
  onChange?: (isChecked: boolean) => void;
}> = ({ optionName, label, description, options, setOption, onChange }) => {
  const descriptionId = useStableId();
  return (
    <div className="options__form__row">
      <Switch
        isChecked={options[optionName]}
        onChange={(isChecked) => {
          setOption(optionName, isChecked);
          onChange?.(isChecked);
        }}
        label={label}
        describedBy={descriptionId}
      />
      <InfoPopover contentId={descriptionId}>{description}</InfoPopover>
    </div>
  );
};

export default OptionsForm;
