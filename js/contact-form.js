import { addAddressRow, getAddressRows, resetAddressRows } from "./address-fields.js";
import { addPhoneRow, getPhoneRows, resetPhoneRows } from "./phone-fields.js";
import { addDateRow, getDateRows, resetDateRows } from "./date-fields.js";
import { addNumberRow, getNumberRows, resetNumberRows } from "./number-fields.js";

export function createContactForm({ contactForm, formTitle, phoneList, addressList, dateList, numberList, fields }) {
  function getContactValues() {
    return {
      name: fields.name.value.trim(),
      phones: getPhoneRows(phoneList).filter((phone) => phone.number),
      addresses: getAddressRows(addressList),
      dates: getDateRows(dateList),
      numbers: getNumberRows(numberList),
      email: fields.email.value.trim(),
      notes: fields.notes.value.trim(),
    };
  }

  function resetRows(phones, addresses, dates, numbers) {
    resetPhoneRows(phoneList, phones);
    resetAddressRows(addressList, addresses);
    resetDateRows(dateList, dates);
    resetNumberRows(numberList, numbers);
  }

  function reset() {
    contactForm.reset();
    resetRows();
    formTitle.textContent = "Add Contact";
  }

  function populate(contact) {
    fields.name.value = contact.name;
    resetRows(contact.phones || [], contact.addresses || [], contact.dates || [], contact.numbers || []);
    fields.email.value = contact.email;
    fields.notes.value = contact.notes;
    formTitle.textContent = "Edit Contact";
  }

  return {
    addPhoneRow: () => addPhoneRow(phoneList),
    addAddressRow: () => addAddressRow(addressList),
    addDateRow: () => addDateRow(dateList),
    addNumberRow: () => addNumberRow(numberList),
    getContactValues,
    populate,
    reset,
    resetRows,
  };
}
