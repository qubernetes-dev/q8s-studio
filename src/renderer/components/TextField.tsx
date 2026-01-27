import React from 'react';
import InfoButton from './InfoButton';

export interface inputFieldProps {
  label: string;
  fieldValue: string;
  autofocus?: boolean;
  inputName: string;
  handleChange: (e) => void;
  documentationText?: string;
  shortDescription?: string;
  required?: boolean;
  pattern?: string;
  validationMessage?: string;
}

/**
 * A component to display a button for selecting a file or directory.
 */
export default function TextField({
  label,
  autofocus = false,
  fieldValue,
  handleChange,
  inputName: inputType,
  documentationText,
  shortDescription,
  required,
  pattern,
  validationMessage,
}: inputFieldProps) {
  return (
    <div className="input-div">
      <label className="text-input" htmlFor={inputType}>
        <span>{label + (required ? ' *' : '')}</span>
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autofocus}
          type="text"
          name={inputType}
          value={fieldValue}
          required={required}
          pattern={pattern}
          maxLength={255}
          onChange={(e) => {
            handleChange(e);
            // If configuration name contains whitespace, inform user that name cannot have spaces
            if (!e.target.checkValidity()) {
              e.target.setCustomValidity(
                validationMessage
              );
              e.target.reportValidity();
            }
          }}
          // onChange={(e) => {
          //   setConfigurationName(e.target.value);
          //   e.target.setCustomValidity('');
          //   // If configuration name contains whitespace, inform user that name cannot have spaces
          //   if (!e.target.checkValidity()) {
          //     e.target.setCustomValidity(
          //       'Name can only contain letters from A-Z,spaces and underscores. ',
          //     );
          //     e.target.reportValidity();
          //   }
          // }}
          // onBlur={(e) => {
          //   if (e.target.checkValidity()) {
          //     console.log("validity OK");
          //     setError('');
          //   } else {
          //     console.log("validity FALSE");
          //     setError('Invalid name');
          //   }
          // }}
        />
      </label>
      <InfoButton
        documentationText=""
        shortDescription={`Enter the ${label.toLowerCase()}. ${validationMessage}`}
      />
    </div>
  );
}
TextField.defaultProps = {
  autofocus: false,
  documentationText: '',
  shortDescription: '',
  pattern: undefined,
  required: false,
  validationMessage: 'Invalid input.',
};
