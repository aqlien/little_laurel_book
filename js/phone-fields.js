import { createLabelPicker } from "./label-picker.js";
import { phoneLabels } from "./label-options.js";

export function addPhoneRow(phoneList, phone = { number: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "phone-row";

  const numberInput = document.createElement("input");
  numberInput.className = "phone-number";
  numberInput.type = "tel";
  numberInput.placeholder = "Phone number";
  numberInput.value = phone.number;

  const labelPicker = createLabelPicker({ options: phoneLabels, type: "phone", value: phone.label, ariaLabel: "Phone label" });
  row.append(numberInput, labelPicker, createRemoveButton());
  phoneList.appendChild(row);
}

export function getPhoneRows(phoneList) {
  return [...phoneList.querySelectorAll(".phone-row")].map((row) => ({
    number: row.querySelector(".phone-number").value.trim(),
    label: row.querySelector(".type-label-picker").dataset.value,
  }));
}

export function resetPhoneRows(phoneList, phones = [{ number: "", label: "" }]) {
  phoneList.replaceChildren();
  phones.forEach((phone) => addPhoneRow(phoneList, phone));
}

function createRemoveButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary remove-phone";
  button.setAttribute("aria-label", "Remove phone number");
  button.textContent = "Remove";
  return button;
}
