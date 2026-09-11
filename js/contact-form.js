import { createLabelPicker } from "./label-picker.js";
import { addressLabels, phoneLabels } from "./label-options.js";

export function createContactForm({ contactForm, formTitle, phoneList, addressList, fields }) {
  function addPhoneRow(phone = { number: "", label: "" }) {
    const row = document.createElement("div");
    row.className = "phone-row";

    const numberInput = document.createElement("input");
    numberInput.className = "phone-number";
    numberInput.type = "tel";
    numberInput.placeholder = "Phone number";
    numberInput.value = phone.number;

    const labelPicker = createLabelPicker({ options: phoneLabels, value: phone.label, ariaLabel: "Phone label" });
    const removeButton = createRemoveButton("remove-phone", "Remove phone number");
    row.append(numberInput, labelPicker, removeButton);
    phoneList.appendChild(row);
  }

  function addAddressRow(address = { line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" }) {
    const row = document.createElement("div");
    row.className = "address-row";
    const fieldsGrid = document.createElement("div");
    fieldsGrid.className = "address-fields";

    [["line1", "Street"], ["line2", "Apt / Suite"], ["city", "City"], ["state", "State"], ["postalCode", "Postal code"], ["country", "Country"]].forEach(([key, placeholder]) => {
      const input = document.createElement("input");
      input.className = "address-field";
      input.placeholder = placeholder;
      input.value = address[key] || "";
      fieldsGrid.appendChild(input);
    });

    const labelPicker = createLabelPicker({ options: addressLabels, value: address.label, ariaLabel: "Address label" });
    const removeButton = createRemoveButton("remove-address", "Remove address");
    row.append(fieldsGrid, labelPicker, removeButton);
    addressList.appendChild(row);
  }

  function getPhoneRows() {
    return [...phoneList.querySelectorAll(".phone-row")].map((row) => ({
      number: row.querySelector(".phone-number").value.trim(),
      label: row.querySelector(".type-label-picker").dataset.value,
    }));
  }

  function getAddressRows() {
    return [...addressList.querySelectorAll(".address-row")]
      .map((row) => {
        const inputs = row.querySelectorAll(".address-field");
        return {
          line1: inputs[0].value.trim(),
          line2: inputs[1].value.trim(),
          city: inputs[2].value.trim(),
          state: inputs[3].value.trim(),
          postalCode: inputs[4].value.trim(),
          country: inputs[5].value.trim(),
          label: row.querySelector(".type-label-picker").dataset.value,
        };
      })
      .filter((address) => [address.line1, address.line2, address.city, address.state, address.postalCode, address.country].some((value) => value));
  }

  function resetRows(phones = [{ number: "", label: "" }], addresses = [{ line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" }]) {
    phoneList.replaceChildren();
    addressList.replaceChildren();
    phones.forEach(addPhoneRow);
    addresses.forEach(addAddressRow);
  }

  function getContactValues() {
    return {
      name: fields.name.value.trim(),
      phones: getPhoneRows().filter((phone) => phone.number),
      addresses: getAddressRows(),
      email: fields.email.value.trim(),
      notes: fields.notes.value.trim(),
    };
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

  return { addPhoneRow, addAddressRow, getContactValues, populate, reset, resetRows };
}

function createRemoveButton(className, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `secondary ${className}`;
  button.setAttribute("aria-label", label);
  button.textContent = "Remove";
  return button;
}
