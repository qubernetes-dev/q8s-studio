import { useState } from 'react';

interface InfoButtonProps {
  documentationText: string | undefined;
  shortDescription: string | undefined;
}

export default function InfoButton({
  documentationText,
  shortDescription,
}: InfoButtonProps) {
  const [tooltip, setTooltip] = useState(false);
  const shortWithDefaultText = `${shortDescription} Click the info button for more information.`;
  return (
    <>
      <button
        type="button"
        className="input-info"
        title={shortWithDefaultText} // Make a string with default text added to the end of the string
        // TODO: example of how to do a tooltip: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role
        onClick={() => {
          setTooltip(!tooltip);
        }}
        aria-describedby="documentationTooltip"
      >
        ?
      </button>
      {tooltip ? (
        <div id="position">
          <div role="tooltip" id="documentationTooltip">
        <div>{documentationText}<p>Press the info button again to close.</p></div>
      </div>
        </div>
      ) : ("")}
    </>
  );
}
