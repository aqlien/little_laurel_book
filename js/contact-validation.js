export function getContactValidationError(contact) {
  if (!contact.name || contact.phones.length === 0) {
    return "Please add a name and at least one phone number.";
  }

  if (contact.phones.length > 1 && contact.phones.some((phone) => !phone.label)) {
    return "Please label every phone number when a contact has more than one.";
  }

  if (contact.addresses.length > 1 && contact.addresses.some((address) => !address.label)) {
    return "Please label every address when a contact has more than one.";
  }

  return null;
}
