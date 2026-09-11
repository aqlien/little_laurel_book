export function createLabelPicker({ options, value = "", ariaLabel }) {
  const selected = options.find((option) => option.value === value) || options[0];
  const picker = document.createElement("div");
  picker.className = "phone-label-picker";
  picker.dataset.value = selected.value;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "phone-label-button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", ariaLabel);
  renderLabel(button, selected);

  const menu = document.createElement("div");
  menu.className = "phone-label-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  options.forEach((option) => menu.appendChild(createOption(option, selected.value)));

  picker.append(button, menu);
  return picker;
}

export function attachLabelPickerEvents(container, options) {
  container.addEventListener("click", (event) => {
    const picker = event.target.closest(".phone-label-picker");
    if (!picker || !container.contains(picker)) return;

    const button = event.target.closest(".phone-label-button");
    if (button) {
      const menu = picker.querySelector(".phone-label-menu");
      const isOpen = !menu.hidden;
      closeLabelPickers();
      menu.hidden = isOpen;
      button.setAttribute("aria-expanded", String(!isOpen));
      return;
    }

    const optionElement = event.target.closest(".phone-label-option");
    if (!optionElement) return;

    const option = options.find((item) => item.value === optionElement.dataset.value) || options[0];
    picker.dataset.value = option.value;
    renderLabel(picker.querySelector(".phone-label-button"), option);
    picker.querySelectorAll(".phone-label-option").forEach((item) => {
      item.setAttribute("aria-selected", String(item === optionElement));
    });
    picker.querySelector(".phone-label-menu").hidden = true;
    picker.querySelector(".phone-label-button").setAttribute("aria-expanded", "false");
  });

  container.addEventListener("keydown", (event) => {
    const picker = event.target.closest(".phone-label-picker");
    if (!picker || !container.contains(picker)) return;

    const button = picker.querySelector(".phone-label-button");
    const menu = picker.querySelector(".phone-label-menu");
    const optionElements = [...picker.querySelectorAll(".phone-label-option")];
    const currentIndex = optionElements.findIndex((option) => option.getAttribute("aria-selected") === "true");

    if (event.target === button && ["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      menu.hidden = false;
      button.setAttribute("aria-expanded", "true");
      optionElements[currentIndex >= 0 ? currentIndex : 0].focus();
    } else if (event.target.classList.contains("phone-label-option")) {
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
    }
  });
}

export function closeLabelPickers() {
  document.querySelectorAll(".phone-label-menu").forEach((menu) => {
    menu.hidden = true;
    menu.previousElementSibling.setAttribute("aria-expanded", "false");
  });
}

function createOption(option, selected) {
  const element = document.createElement("div");
  element.className = "phone-label-option";
  element.setAttribute("role", "option");
  element.tabIndex = 0;
  element.setAttribute("aria-selected", String(option.value === selected));
  element.dataset.value = option.value;

  const icon = createIcon(option);
  if (icon) element.append(icon);
  element.append(document.createTextNode(option.text));
  return element;
}

function renderLabel(button, option) {
  button.replaceChildren();
  const icon = createIcon(option);
  if (icon) button.append(icon);
  button.append(document.createTextNode(option.text));
}

function createIcon(option) {
  if (!option.icon) return null;

  const icon = document.createElement("img");
  icon.className = "phone-label-icon";
  icon.src = option.icon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  icon.addEventListener("error", () => icon.remove());
  return icon;
}
