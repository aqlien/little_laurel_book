let contacts = [];
let editingId = null;

const searchInput = document.getElementById("searchInput");
const contactList = document.getElementById("contactList");
const contactForm = document.getElementById("contactForm");
const formTitle = document.getElementById("formTitle");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const addPhoneBtn = document.getElementById("addPhoneBtn");
const phoneList = document.getElementById("phoneList");

const fields = {
  name: document.getElementById("nameInput"),
  email: document.getElementById("emailInput"),
  notes: document.getElementById("notesInput"),
};

const phoneLabels = [
  { value: "", text: "No label", icon: "assets/icons/phone-labels/none.svg" },
  { value: "Home", text: "Home", icon: "assets/icons/phone-labels/home.svg" },
  { value: "Work", text: "Work", icon: "assets/icons/phone-labels/work.svg" },
  { value: "Mobile", text: "Mobile", icon: "assets/icons/phone-labels/mobile.svg" },
];

function getPhoneLabel(label) {
  return phoneLabels.find((option) => option.value === label) || phoneLabels[0];
}

function createLabelIcon(option) {
  const icon = document.createElement("img");
  icon.className = "phone-label-icon";
  icon.src = option.icon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  icon.addEventListener("error", () => icon.remove());
  return icon;
}

function createLabelOption(option, selected) {
  const element = document.createElement("div");
  element.className = "phone-label-option";
  element.setAttribute("role", "option");
  element.tabIndex = 0;
  element.setAttribute("aria-selected", String(option.value === selected));
  element.dataset.value = option.value;
  element.append(createLabelIcon(option), document.createTextNode(option.text));
  return element;
}

function addPhoneRow(phone = { number: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "phone-row";
  const numberInput = document.createElement("input");
  numberInput.className = "phone-number";
  numberInput.type = "tel";
  numberInput.placeholder = "Phone number";
  numberInput.value = phone.number;

  const label = getPhoneLabel(phone.label);
  const labelPicker = document.createElement("div");
  labelPicker.className = "phone-label-picker";
  labelPicker.dataset.value = label.value;

  const labelButton = document.createElement("button");
  labelButton.type = "button";
  labelButton.className = "phone-label-button";
  labelButton.setAttribute("aria-haspopup", "listbox");
  labelButton.setAttribute("aria-expanded", "false");
  labelButton.setAttribute("aria-label", "Phone label");
  labelButton.append(createLabelIcon(label), document.createTextNode(label.text));

  const labelMenu = document.createElement("div");
  labelMenu.className = "phone-label-menu";
  labelMenu.setAttribute("role", "listbox");
  labelMenu.hidden = true;
  phoneLabels.forEach((option) => labelMenu.appendChild(createLabelOption(option, label.value)));

  labelPicker.append(labelButton, labelMenu);
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "secondary remove-phone";
  removeButton.setAttribute("aria-label", "Remove phone number");
  removeButton.textContent = "Remove";
  row.append(numberInput, labelPicker, removeButton);
  phoneList.appendChild(row);
}

function getPhoneRows() {
  return [...phoneList.querySelectorAll(".phone-row")].map((row) => ({
    number: row.querySelector(".phone-number").value.trim(),
    label: row.querySelector(".phone-label-picker").dataset.value,
  }));
}

function resetPhoneRows(phones = [{ number: "", label: "" }]) {
  phoneList.replaceChildren();
  phones.forEach(addPhoneRow);
}

async function loadContacts() {
  contacts = await window.electronApi.loadContacts();
}

function resetForm() {
  contactForm.reset();
  resetPhoneRows();
  editingId = null;
  formTitle.textContent = "Add Contact";
  contactForm.classList.remove("open");
}

function openForm() {
  contactForm.classList.add("open");
}

function renderContacts() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = contacts.filter((contact) => {
    const phoneText = contact.phones.map((phone) => `${phone.number} ${phone.label}`).join(" ");
    const text = `${contact.name} ${phoneText} ${contact.email} ${contact.notes}`.toLowerCase();
    return text.includes(term);
  });

  if (filtered.length === 0) {
    contactList.innerHTML = '<div class="empty">No contacts yet.</div>';
    return;
  }

  contactList.innerHTML = filtered
    .map(
      (contact) => `
        <div class="contact-card">
          <div class="contact-name">${contact.name}</div>
          ${contact.phones.map((phone) => `<div class="contact-meta">Phone${phone.label ? ` (${phone.label})` : ""}: ${phone.number}</div>`).join("")}
          <div class="contact-meta">Email: ${contact.email || "—"}</div>
          <div class="contact-meta">Notes: ${contact.notes || "—"}</div>
          <div class="contact-actions">
            <button data-action="edit" data-id="${contact.id}">Edit</button>
            <button data-action="delete" data-id="${contact.id}">Delete</button>
          </div>
        </div>
      `,
    )
    .join("");
}

async function saveContact(event) {
  event.preventDefault();

  const entry = {
    id: editingId || Date.now().toString(),
    name: fields.name.value.trim(),
    phones: getPhoneRows().filter((phone) => phone.number),
    email: fields.email.value.trim(),
    notes: fields.notes.value.trim(),
  };

  if (!entry.name || entry.phones.length === 0) {
    alert("Please add a name and at least one phone number.");
    return;
  }

  if (entry.phones.length > 1 && entry.phones.some((phone) => !phone.label)) {
    alert("Please label every phone number when a contact has more than one.");
    return;
  }

  await window.electronApi.saveContact(entry);
  await loadContacts();
  renderContacts();
  resetForm();
}

function startEditing(id) {
  const contact = contacts.find((item) => item.id === id);
  if (!contact) return;

  editingId = id;
  formTitle.textContent = "Edit Contact";
  fields.name.value = contact.name;
  resetPhoneRows(contact.phones);
  fields.email.value = contact.email;
  fields.notes.value = contact.notes;
  openForm();
}

async function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.getAttribute("data-id");
  const action = button.getAttribute("data-action");

  if (action === "edit") {
    startEditing(id);
  } else if (action === "delete") {
    await window.electronApi.deleteContact(id);
    await loadContacts();
    renderContacts();
  }
}

addBtn.addEventListener("click", openForm);
addPhoneBtn.addEventListener("click", () => addPhoneRow());
cancelBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderContacts);
contactForm.addEventListener("submit", saveContact);
contactList.addEventListener("click", handleListClick);
phoneList.addEventListener("click", (event) => {
  const labelButton = event.target.closest(".phone-label-button");
  if (labelButton) {
    const menu = labelButton.nextElementSibling;
    const isOpen = !menu.hidden;
    document.querySelectorAll(".phone-label-menu").forEach((item) => {
      item.hidden = true;
      item.previousElementSibling.setAttribute("aria-expanded", "false");
    });
    menu.hidden = isOpen;
    labelButton.setAttribute("aria-expanded", String(!isOpen));
    return;
  }

  const labelOption = event.target.closest(".phone-label-option");
  if (labelOption) {
    const picker = labelOption.closest(".phone-label-picker");
    const option = getPhoneLabel(labelOption.dataset.value);
    picker.dataset.value = option.value;
    const button = picker.querySelector(".phone-label-button");
    button.replaceChildren(createLabelIcon(option), document.createTextNode(option.text));
    picker.querySelectorAll(".phone-label-option").forEach((item) => {
      item.setAttribute("aria-selected", String(item === labelOption));
    });
    picker.querySelector(".phone-label-menu").hidden = true;
    button.setAttribute("aria-expanded", "false");
    return;
  }

  if (event.target.closest(".remove-phone")) {
    event.target.closest(".phone-row").remove();
  }
});

phoneList.addEventListener("keydown", (event) => {
  const picker = event.target.closest(".phone-label-picker");
  if (!picker) return;

  const button = picker.querySelector(".phone-label-button");
  const menu = picker.querySelector(".phone-label-menu");
  const options = [...picker.querySelectorAll(".phone-label-option")];
  const currentIndex = options.findIndex((option) => option.getAttribute("aria-selected") === "true");

  if (event.target === button && ["Enter", " ", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
    options[currentIndex >= 0 ? currentIndex : 0].focus();
  } else if (event.target.classList.contains("phone-label-option")) {
    const optionIndex = options.indexOf(event.target);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      options[(optionIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length].focus();
    } else if (event.key === "Enter" || event.key === " ") {
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

document.addEventListener("click", (event) => {
  if (!event.target.closest(".phone-label-picker")) {
    document.querySelectorAll(".phone-label-menu").forEach((menu) => {
      menu.hidden = true;
      menu.previousElementSibling.setAttribute("aria-expanded", "false");
    });
  }
});

resetPhoneRows();
loadContacts().then(renderContacts).catch(() => {
  contactList.innerHTML = '<div class="empty">Unable to load contacts.</div>';
});
