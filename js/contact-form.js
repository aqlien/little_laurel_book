import { addAddressRow, getAddressRows, resetAddressRows } from "./address-fields.js";
import { addPhoneRow, getPhoneRows, resetPhoneRows } from "./phone-fields.js";

export function createContactForm({ contactForm, formTitle, phoneList, addressList, fields }) {
  function getContactValues() {
    return {
      name: fields.name.value.trim(),
      phones: getPhoneRows(phoneList).filter((phone) => phone.number),
      addresses: getAddressRows(addressList),
      email: fields.email.value.trim(),
      notes: fields.notes.value.trim(),
    };
  }

  function resetRows(phones, addresses) {
    resetPhoneRows(phoneList, phones);
    resetAddressRows(addressList, addresses);
  }

  function reset() {
    contactForm.reset();
    resetRows();
    formTitle.textContent = "Add Contact";
  }

  function populate(contact) {
    fields.name.value = contact.name;
    resetRows(contact.phones || [], contact.addresses || []);
    fields.email.value = contact.email;
    fields.notes.value = contact.notes;
    formTitle.textContent = "Edit Contact";
  }

  return {
    addPhoneRow: () => addPhoneRow(phoneList),
    addAddressRow: () => addAddressRow(addressList),
    getContactValues,
    populate,
    reset,
    resetRows,
  };
}
