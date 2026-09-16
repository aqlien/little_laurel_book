import { createLabelPicker } from "./label-picker.js";
import { dateLabels } from "./label-options.js";

export function registerDateLabels(dates) {
  dates.forEach((date) => {
    const label = String(date.label || "").trim();
    if (label && !dateLabels.some((option) => option.value === label)) dateLabels.push({ value: label, text: label });
  });
}

export function addDateRow(dateList, date = { date: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "date-row";

  const dateInput = document.createElement("input");
  dateInput.className = "important-date";
  dateInput.type = "date";
  dateInput.value = date.date || "";

  const labelPicker = createLabelPicker({
    options: dateLabels,
    type: "date",
    value: date.label,
    ariaLabel: "Important date label",
    allowCustom: true,
  });
  row.append(dateInput, labelPicker, createRemoveButton());
  dateList.appendChild(row);
}

export function getDateRows(dateList) {
  return [...dateList.querySelectorAll(".date-row")]
    .map((row) => ({
      date: row.querySelector(".important-date").value,
      label: row.querySelector(".type-label-picker").dataset.value,
    }))
    .filter((date) => date.date);
}

export function resetDateRows(dateList, dates = []) {
  registerDateLabels(dates);
  dateList.replaceChildren();
  dates.forEach((date) => addDateRow(dateList, date));
}

function createRemoveButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary remove-date";
  button.setAttribute("aria-label", "Remove important date");
  button.textContent = "Remove";
  return button;
}