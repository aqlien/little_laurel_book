import { createLabelPicker } from "./label-picker.js";
import { addressLabels } from "./label-options.js";

const addressFields = [
  ["line1", "Street"],
  ["line2", "Apt / Suite"],
  ["city", "City"],
  ["state", "State"],
  ["postalCode", "Postal code"],
  ["country", "Country"],
];

export function addAddressRow(addressList, address = {}) {
  const row = document.createElement("div");
  row.className = "address-row";
  const fieldsGrid = document.createElement("div");
  fieldsGrid.className = "address-fields";

  addressFields.forEach(([key, placeholder]) => {
    const input = document.createElement("input");
    input.className = "address-field";
    input.placeholder = placeholder;
    input.value = address[key] || "";
    fieldsGrid.appendChild(input);
  });

  const labelPicker = createLabelPicker({ options: addressLabels, value: address.label, ariaLabel: "Address label" });
  row.append(fieldsGrid, labelPicker, createRemoveButton());
  addressList.appendChild(row);
}

export function getAddressRows(addressList) {
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
    .filter((address) => addressFields.some(([key]) => address[key]));
}

export function resetAddressRows(addressList, addresses = [{ line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" }]) {
  addressList.replaceChildren();
  addresses.forEach((address) => addAddressRow(addressList, address));
}

function createRemoveButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary remove-address";
  button.setAttribute("aria-label", "Remove address");
  button.textContent = "Remove";
  return button;
}
