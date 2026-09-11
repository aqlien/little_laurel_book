import { deleteContact, loadContacts, saveContact } from "./contact-store.js";
import { attachLabelPickerEvents, closeLabelPickers, createLabelPicker } from "./label-picker.js";

let contacts = [];
let editingId = null;

const searchInput = document.getElementById("searchInput");
const contactList = document.getElementById("contactList");
const contactForm = document.getElementById("contactForm");
const formTitle = document.getElementById("formTitle");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const addPhoneBtn = document.getElementById("addPhoneBtn");
const addAddressBtn = document.getElementById("addAddressBtn");
const phoneList = document.getElementById("phoneList");
const addressList = document.getElementById("addressList");

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

const addressLabels = [
  { value: "", text: "No label" },
  { value: "Home", text: "Home" },
  { value: "Work", text: "Work" },
  { value: "Other", text: "Other" },
];

function addPhoneRow(phone = { number: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "phone-row";

  const numberInput = document.createElement("input");
  numberInput.className = "phone-number";
  numberInput.type = "tel";
  numberInput.placeholder = "Phone number";
  numberInput.value = phone.number;

  const labelPicker = createLabelPicker({ options: phoneLabels, value: phone.label, ariaLabel: "Phone label" });
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "secondary remove-phone";
  removeButton.setAttribute("aria-label", "Remove phone number");
  removeButton.textContent = "Remove";

  row.append(numberInput, labelPicker, removeButton);
  phoneList.appendChild(row);
}

function addAddressRow(address = { line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "address-row";

  const fieldsGrid = document.createElement("div");
  fieldsGrid.className = "address-fields";

  [
  ["line1", "Street"],
  ["line2", "Apt / Suite"],
  ["city", "City"],
  ["state", "State"],
  ["postalCode", "Postal code"],
  ["country", "Country"],
  ].forEach(([key, placeholder]) => {
    const input = document.createElement("input");
    input.className = "address-field";
  input.placeholder = placeholder;
  input.value = address[key] || "";
  fieldsGrid.appendChild(input);
  });

  const labelPicker = createLabelPicker({ options: addressLabels, value: address.label, ariaLabel: "Address label" });
  labelPicker.classList.add("address-label-picker");

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "secondary remove-address";
  removeButton.setAttribute("aria-label", "Remove address");
  removeButton.textContent = "Remove";

  row.append(fieldsGrid, labelPicker, removeButton);
  addressList.appendChild(row);
}

function getPhoneRows() {
  return [...phoneList.querySelectorAll(".phone-row")].map((row) => ({
    number: row.querySelector(".phone-number").value.trim(),
    label: row.querySelector(".phone-label-picker").dataset.value,
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
        label: row.querySelector(".address-label-picker").dataset.value,
      };
    })
  .filter((address) => [address.line1, address.line2, address.city, address.state, address.postalCode, address.country].some((value) => value));
}

function resetPhoneRows(phones = [{ number: "", label: "" }]) {
  phoneList.replaceChildren();
  phones.forEach(addPhoneRow);
}

function resetAddressRows(addresses = [{ line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" }]) {
  addressList.replaceChildren();
  addresses.forEach(addAddressRow);
}

function resetForm() {
  contactForm.reset();
  resetPhoneRows();
  resetAddressRows();
  editingId = null;
  formTitle.textContent = "Add Contact";
  contactForm.classList.remove("open");
}

function openForm() {
  contactForm.classList.add("open");
}

function formatAddress(address) {
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.postalCode, address.country].filter(Boolean).join(" "),
  ].filter(Boolean).join(", ");
}

function renderContacts() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = contacts.filter((contact) => {
    const phoneText = (contact.phones || []).map((phone) => `${phone.number} ${phone.label}`).join(" ");
    const addressText = (contact.addresses || []).map((address) => `${formatAddress(address)} ${address.label}`).join(" ");
    return `${contact.name} ${phoneText} ${addressText} ${contact.email} ${contact.notes}`.toLowerCase().includes(term);
  });
  if (filtered.length === 0) {
    contactList.innerHTML = '<div class="empty">No contacts yet.</div>';
    return;
  }

  contactList.innerHTML = filtered.map((contact) => `
    <div class="contact-card">
      <div class="contact-name">${contact.name}</div>
      ${(contact.phones || []).map((phone) => `<div class="contact-meta">Phone${phone.label ? ` (${phone.label})` : ""}: ${phone.number}</div>`).join("")}
  ${(contact.addresses || []).map((address) => `<div class="contact-meta">Address${address.label ? ` (${address.label})` : ""}: ${formatAddress(address)}</div>`).join("")}
  <div class="contact-meta">Email: ${contact.email || "—"}</div>
  <div class="contact-meta">Notes: ${contact.notes || "—"}</div>
      <div class="contact-actions">
        <button data-action="edit" data-id="${contact.id}">Edit</button>
        <button data-action="delete" data-id="${contact.id}">Delete</button>
      </div>
    </div>
  `).join("");
}

async function saveContactForm(event) {
  event.preventDefault();
  const entry = {
    id: editingId || Date.now().toString(),
  name: fields.name.value.trim(),
  phones: getPhoneRows().filter((phone) => phone.number),
  addresses: getAddressRows(),
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
  if (entry.addresses.length > 1 && entry.addresses.some((address) => !address.label)) {
    alert("Please label every address when a contact has more than one.");
    return;
  }

  await saveContact(entry);
  contacts = await loadContacts();
  renderContacts();
  resetForm();
}

function startEditing(id) {
  const contact = contacts.find((item) => item.id === id);
  if (!contact) return;

  editingId = id;
  formTitle.textContent = "Edit Contact";
  fields.name.value = contact.name;
  resetPhoneRows(contact.phones || []);
  resetAddressRows(contact.addresses || []);
  fields.email.value = contact.email;
  fields.notes.value = contact.notes;
  openForm();
}

async function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.getAttribute("data-id");
  if (button.getAttribute("data-action") === "edit") {
    startEditing(id);
    return;
  }

  await deleteContact(id);
  contacts = await loadContacts();
  renderContacts();
}

addBtn.addEventListener("click", openForm);
addPhoneBtn.addEventListener("click", () => addPhoneRow());
addAddressBtn.addEventListener("click", () => addAddressRow());
cancelBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderContacts);
contactForm.addEventListener("submit", saveContactForm);
contactList.addEventListener("click", handleListClick);
attachLabelPickerEvents(phoneList, phoneLabels);
attachLabelPickerEvents(addressList, addressLabels);

phoneList.addEventListener("click", (event) => {
  if (event.target.closest(".remove-phone")) event.target.closest(".phone-row").remove();
});

addressList.addEventListener("click", (event) => {
  if (event.target.closest(".remove-address")) event.target.closest(".address-row").remove();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".phone-label-picker")) closeLabelPickers();
});

resetPhoneRows();
resetAddressRows();
loadContacts().then((loadedContacts) => {
  contacts = loadedContacts;
  renderContacts();
}).catch(() => {
  contactList.innerHTML = '<div class="empty">Unable to load contacts.</div>';
});
import { deleteContact, loadContacts, saveContact } from "./contact-store.js";
import { attachLabelPickerEvents, closeLabelPickers, createLabelPicker } from "./label-picker.js";

let contacts = [];
let editingId = null;

const searchInput = document.getElementById("searchInput");
const contactList = document.getElementById("contactList");
const contactForm = document.getElementById("contactForm");
const formTitle = document.getElementById("formTitle");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const addPhoneBtn = document.getElementById("addPhoneBtn");
const addAddressBtn = document.getElementById("addAddressBtn");
const phoneList = document.getElementById("phoneList");
const addressList = document.getElementById("addressList");

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

const addressLabels = [
  { value: "", text: "No label" },
  { value: "Home", text: "Home" },
  { value: "Work", text: "Work" },
  { value: "Other", text: "Other" },
];

function addPhoneRow(phone = { number: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "phone-row";

  const numberInput = document.createElement("input");
  numberInput.className = "phone-number";
  numberInput.type = "tel";
  numberInput.placeholder = "Phone number";
  numberInput.value = phone.number;

  const labelPicker = createLabelPicker({ options: phoneLabels, value: phone.label, ariaLabel: "Phone label" });

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "secondary remove-phone";
  removeButton.setAttribute("aria-label", "Remove phone number");
  removeButton.textContent = "Remove";

  row.append(numberInput, labelPicker, removeButton);
  phoneList.appendChild(row);
}

function addAddressRow(address = { line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "address-row";

  const fieldsGrid = document.createElement("div");
  fieldsGrid.className = "address-fields";

  const line1 = document.createElement("input");
  line1.className = "address-field";
  line1.placeholder = "Street";
  line1.value = address.line1 || "";

  const line2 = document.createElement("input");
  line2.className = "address-field";
  line2.placeholder = "Apt / Suite";
  line2.value = address.line2 || "";

  const city = document.createElement("input");
  city.className = "address-field";
  city.placeholder = "City";
  city.value = address.city || "";

  const state = document.createElement("input");
  state.className = "address-field";
  state.placeholder = "State";
  state.value = address.state || "";

  const postalCode = document.createElement("input");
  postalCode.className = "address-field";
  postalCode.placeholder = "Postal code";
  postalCode.value = address.postalCode || "";

  const country = document.createElement("input");
  country.className = "address-field";
  country.placeholder = "Country";
  country.value = address.country || "";

  const labelPicker = createLabelPicker({ options: addressLabels, value: address.label, ariaLabel: "Address label" });

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "secondary remove-address";
  removeButton.setAttribute("aria-label", "Remove address");
  removeButton.textContent = "Remove";

  fieldsGrid.append(line1, line2, city, state, postalCode, country);
  row.append(fieldsGrid, labelPicker, removeButton);
  addressList.appendChild(row);
}

function getPhoneRows() {
  return [...phoneList.querySelectorAll(".phone-row")].map((row) => ({
    number: row.querySelector(".phone-number").value.trim(),
    label: row.querySelector(".phone-label-picker").dataset.value,
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
        label: row.querySelector(".address-label-picker").dataset.value,
      };
    })
    .filter((address) => [address.line1, address.line2, address.city, address.state, address.postalCode, address.country].some((value) => value));
}

function resetPhoneRows(phones = [{ number: "", label: "" }]) {
  phoneList.replaceChildren();
  phones.forEach(addPhoneRow);
}

function resetAddressRows(addresses = [{ line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" }]) {
  addressList.replaceChildren();
  addresses.forEach(addAddressRow);
}

function resetForm() {
  contactForm.reset();
  resetPhoneRows();
  resetAddressRows();
  editingId = null;
  formTitle.textContent = "Add Contact";
  contactForm.classList.remove("open");
}

function openForm() {
  contactForm.classList.add("open");
}

function formatAddress(address) {
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.postalCode, address.country].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function renderContacts() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = contacts.filter((contact) => {
    const phoneText = (contact.phones || []).map((phone) => `${phone.number} ${phone.label}`).join(" ");
    const addressText = (contact.addresses || []).map((address) => `${formatAddress(address)} ${address.label}`).join(" ");
    const text = `${contact.name} ${phoneText} ${addressText} ${contact.email} ${contact.notes}`.toLowerCase();
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
          ${(contact.phones || []).map((phone) => `<div class="contact-meta">Phone${phone.label ? ` (${phone.label})` : ""}: ${phone.number}</div>`).join("") || ""}
          ${(contact.addresses || []).map((address) => `<div class="contact-meta">Address${address.label ? ` (${address.label})` : ""}: ${formatAddress(address)}</div>`).join("") || ""}
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
    addresses: getAddressRows(),
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

  if (entry.addresses.length > 1 && entry.addresses.some((address) => !address.label)) {
    alert("Please label every address when a contact has more than one.");
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
  resetPhoneRows(contact.phones || []);
  resetAddressRows(contact.addresses || []);
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
    await deleteContact(id);
}

addBtn.addEventListener("click", openForm);
addPhoneBtn.addEventListener("click", () => addPhoneRow());
addAddressBtn.addEventListener("click", () => addAddressRow());
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
    button.replaceChildren();

    const chosenIcon = createLabelIcon(option);
    if (chosenIcon) {
      button.appendChild(chosenIcon);
    }
    button.append(document.createTextNode(option.text));
  if (event.target.closest(".remove-phone")) {
    event.target.closest(".phone-row").remove();
  }
  }

  if (event.target.closest(".remove-phone")) {
    event.target.closest(".phone-row").remove();
  }
});

addressList.addEventListener("click", (event) => {
  const labelButton = event.target.closest(".address-label-picker .phone-label-button");
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

  const labelOption = event.target.closest(".address-label-picker .phone-label-option");
  if (labelOption) {
    const picker = labelOption.closest(".address-label-picker");
    const option = addressLabels.find((item) => item.value === labelOption.dataset.value) || addressLabels[0];
    picker.dataset.value = option.value;
    const button = picker.querySelector(".phone-label-button");
    button.textContent = option.text;
    picker.querySelector(".phone-label-menu").hidden = true;
    button.setAttribute("aria-expanded", "false");
    return;
  }

[phoneList, addressList].forEach((labelList) => labelList.addEventListener("keydown", (event) => {
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
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      options[(optionIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length].focus();
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
}));
  if (event.target.closest(".remove-address")) {
    event.target.closest(".address-row").remove();
  }
});

[phoneList, addressList].forEach((labelList) => labelList.addEventListener("keydown", (event) => {
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
}));

document.addEventListener("click", (event) => {
  if (!event.target.closest(".phone-label-picker")) {
    document.querySelectorAll(".phone-label-menu").forEach((menu) => {
      menu.hidden = true;
      menu.previousElementSibling.setAttribute("aria-expanded", "false");
    });
  }
});

resetPhoneRows();
resetAddressRows();
loadContacts().then(renderContacts).catch(() => {
  contactList.innerHTML = '<div class="empty">Unable to load contacts.</div>';
});
