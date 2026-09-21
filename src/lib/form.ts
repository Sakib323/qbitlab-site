export type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Per-field wording, so a form can say something better than the browser default. */
export type Messages = Record<string, (field: FormField) => string>;

/** Marks a field valid or not, and writes the message into its `<id>-error` element. */
export function checkField(field: FormField, messages: Messages) {
  const error = document.getElementById(`${field.id}-error`);
  const invalid = !field.validity.valid;
  field.setAttribute('aria-invalid', String(invalid));
  if (error) error.textContent = invalid ? (messages[field.name]?.(field) ?? field.validationMessage) : '';
  return !invalid;
}

/** Clears a field's error once it is valid again — never while it is still being typed in. */
export function clearField(field: FormField, messages: Messages) {
  if (field.getAttribute('aria-invalid') !== 'true') return;
  if (field.validity.valid) checkField(field, messages);
}

/** Checks every required field, marks them all, and focuses the first that failed. */
export function checkRequired(form: HTMLFormElement, messages: Messages) {
  const fields = Array.from(form.querySelectorAll<FormField>('[required]'));
  const invalid = fields.filter((field) => !checkField(field, messages));
  invalid[0]?.focus();
  return invalid.length === 0;
}
