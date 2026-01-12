interface InfoButtonProps {
  documentationText: string;
  shortDescription: string;
}

export default function InfoButton({
  documentationText,
  shortDescription,
}: InfoButtonProps) {
  return (
    <button
      type="button"
      className="input-info"
      title={shortDescription} // Make a string with default text added to the end of the string
      // example of how to do a tooltip: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role
      onClick={() => {
        console.log('object');
      }}
    >
      ?
    </button>
  );
}
