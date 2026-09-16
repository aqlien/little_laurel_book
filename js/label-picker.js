import { createLabelIcon } from "./label-icons.js";

export function createLabelPicker({ options, type, value = "", ariaLabel, allowCustom = false, customLabelPlaceholder = "Custom label" }) {
  const selected = options.find((option) => option.value === value) || (value ? { value, text: value } : options[0]);
  const picker = document.createElement("div");
  picker.className = "type-label-picker";
  picker.dataset.value = selected.value;
  picker.dataset.allowCustom = String(allowCustom);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "type-label-button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", ariaLabel);
  renderLabel(button, selected, type);

  const menu = document.createElement("div");
  menu.className = "type-label-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  options.forEach((option) => menu.appendChild(createOption(option, selected.value, type)));
  if (allowCustom) menu.appendChild(createCustomOption(customLabelPlaceholder));

  picker.append(button, menu);
  return picker;
}

export function attachLabelPickerEvents(container, options, type) {
  container.addEventListener("click", (event) => {
    const picker = event.target.closest(".type-label-picker");
    if (!picker || !container.contains(picker)) return;

    const button = event.target.closest(".type-label-button");
    if (button) {
      const menu = picker.querySelector(".type-label-menu");
      const isOpen = !menu.hidden;
      refreshOptions(picker, options, type);
      closeLabelPickers();
      menu.hidden = isOpen;
      button.setAttribute("aria-expanded", String(!isOpen));
      return;
    }

    const addCustomButton = event.target.closest(".type-label-custom-add");
    if (addCustomButton) {
      const customInput = picker.querySelector(".type-label-custom-input");
      selectCustomLabel(picker, options, type, customInput.value);
      return;
    }

    const optionElement = event.target.closest(".type-label-option");
    if (!optionElement) return;

    const option = options.find((item) => item.value === optionElement.dataset.value) || options[0];
    picker.dataset.value = option.value;
    renderLabel(picker.querySelector(".type-label-button"), option, type);
    picker.querySelectorAll(".type-label-option").forEach((item) => {
      item.setAttribute("aria-selected", String(item === optionElement));
    });
    picker.querySelector(".type-label-menu").hidden = true;
    picker.querySelector(".type-label-button").setAttribute("aria-expanded", "false");
  });

  container.addEventListener("input", (event) => {
    const picker = event.target.closest(".type-label-picker");
    if (!picker || !container.contains(picker) || !event.target.classList.contains("type-label-custom-input")) return;
    picker.querySelector(".type-label-custom-add").disabled = !event.target.value.trim();
  });

  container.addEventListener("keydown", (event) => {
    const picker = event.target.closest(".type-label-picker");
    if (!picker || !container.contains(picker)) return;

    const button = picker.querySelector(".type-label-button");
    const menu = picker.querySelector(".type-label-menu");
    const optionElements = [...picker.querySelectorAll(".type-label-option")];
    const currentIndex = optionElements.findIndex((option) => option.getAttribute("aria-selected") === "true");

    if (event.target === button && ["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      menu.hidden = false;
      button.setAttribute("aria-expanded", "true");
      optionElements[currentIndex >= 0 ? currentIndex : 0].focus();
    } else if (event.target.classList.contains("type-label-option")) {
      const optionIndex = optionElements.indexOf(event.target);
      if (["ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        optionElements[(optionIndex + (event.key === "ArrowDown" ? 1 : -1) + optionElements.length) % optionElements.length].focus();
      } else if (["Enter", " "].includes(event.key)) {
        event.preventDefault();
        event.target.click();
        button.focus();
      } else if (event.key === "Escape") {
        menu.hidden = true;
        button.setAttribute("aria-expanded", "false");
        button.focus();
      }
    } else if (event.target.classList.contains("type-label-custom-input") && event.key === "Enter") {
      event.preventDefault();
      selectCustomLabel(picker, options, type, event.target.value);
    }
  });
}

export function closeLabelPickers() {
  document.querySelectorAll(".type-label-menu").forEach((menu) => {
    menu.hidden = true;
    menu.previousElementSibling.setAttribute("aria-expanded", "false");
  });
}

function createOption(option, selected, type) {
  const element = document.createElement("div");
  element.className = "type-label-option";
  element.setAttribute("role", "option");
  element.tabIndex = 0;
  element.setAttribute("aria-selected", String(option.value === selected));
  element.dataset.value = option.value;

  const icon = createLabelIcon(option, type);
  if (icon) element.append(icon);
  element.append(document.createTextNode(option.text));
  return element;
}

function createCustomOption(placeholder) {
  const wrapper = document.createElement("div");
  wrapper.className = "type-label-custom";

  const input = document.createElement("input");
  input.className = "type-label-custom-input";
  input.type = "text";
  input.placeholder = placeholder;
  input.setAttribute("aria-label", placeholder);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "type-label-custom-add";
  button.textContent = "Add";
  button.disabled = true;

  wrapper.append(input, button);
  return wrapper;
}

function refreshOptions(picker, options, type) {
  const menu = picker.querySelector(".type-label-menu");
  const customOption = menu.querySelector(".type-label-custom");
  options.forEach((option) => {
    if (!menu.querySelector(`.type-label-option[data-value="${CSS.escape(option.value)}"]`)) {
      menu.insertBefore(createOption(option, picker.dataset.value, type), customOption);
    }
  });
}

function selectCustomLabel(picker, options, type, value) {
  const label = value.trim();
  if (!label) return;

  if (!options.some((option) => option.value === label)) options.push({ value: label, text: label });
  const optionElements = [...picker.querySelectorAll(".type-label-option")];
  let optionElement = optionElements.find((element) => element.dataset.value === label);
  if (!optionElement) {
    optionElement = createOption({ value: label, text: label }, picker.dataset.value, type);
    picker.querySelector(".type-label-menu").insertBefore(optionElement, picker.querySelector(".type-label-custom"));
  }
  picker.dataset.value = label;
  renderLabel(picker.querySelector(".type-label-button"), { value: label, text: label }, type);
  picker.querySelectorAll(".type-label-option").forEach((item) => {
    item.setAttribute("aria-selected", String(item === optionElement));
  });
  picker.querySelector(".type-label-menu").hidden = true;
  picker.querySelector(".type-label-button").setAttribute("aria-expanded", "false");
}

function renderLabel(button, option, type) {
  button.replaceChildren();
  const icon = createLabelIcon(option, type);
  if (icon) button.append(icon);
  button.append(document.createTextNode(option.text));
}

