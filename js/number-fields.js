import { createLabelPicker } from "./label-picker.js";
import { numberLabels } from "./label-options.js";

export function registerNumberLabels(numbers) {
  numbers.forEach((number) => {
    const label = String(number.label || "").trim();
    if (label && !numberLabels.some((option) => option.value === label)) numberLabels.push({ value: label, text: label });
  });
}

export function addNumberRow(numberList, number = { number: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "number-row";

  const numberInput = document.createElement("input");
  numberInput.className = "important-number";
  numberInput.type = "text";
  numberInput.placeholder = "Important number";
  numberInput.value = number.number || "";

  const labelPicker = createLabelPicker({
    options: numberLabels,
    value: number.label,
    ariaLabel: "Important number label",
    allowCustom: true,
  });
  row.append(numberInput, labelPicker, createRemoveButton());
  numberList.appendChild(row);
}

export function getNumberRows(numberList) {
  return [...numberList.querySelectorAll(".number-row")]
    .map((row) => ({
      number: row.querySelector(".important-number").value.trim(),
      label: row.querySelector(".type-label-picker").dataset.value,
    }))
    .filter((number) => number.number);
}

export function resetNumberRows(numberList, numbers = []) {
  registerNumberLabels(numbers);
  numberList.replaceChildren();
  numbers.forEach((number) => addNumberRow(numberList, number));
}

function createRemoveButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary remove-number";
  button.setAttribute("aria-label", "Remove important number");
  button.textContent = "Remove";
  return button;
}