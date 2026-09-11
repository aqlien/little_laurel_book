import { deleteContact, loadContacts, saveContact } from "./contact-store.js";
import { attachLabelPickerEvents, closeLabelPickers, createLabelPicker } from "./label-picker.js";
import { createContactList, filterContacts } from "./contact-list.js";
import { addressLabels, phoneLabels } from "./label-options.js";

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

  [["line1", "Street"], ["line2", "Apt / Suite"], ["city", "City"], ["state", "State"], ["postalCode", "Postal code"], ["country", "Country"]].forEach(([key, placeholder]) => {
    const input = document.createElement("input");
    input.className = "address-field";
    input.placeholder = placeholder;
    input.value = address[key] || "";
    fieldsGrid.appendChild(input);
  });

  const labelPicker = createLabelPicker({ options: addressLabels, value: address.label, ariaLabel: "Address label" });
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

function renderContacts() {
  contactList.replaceChildren(...createContactList(filterContacts(contacts, searchInput.value)));
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
  if (!event.target.closest(".type-label-picker")) closeLabelPickers();
});

resetPhoneRows();
resetAddressRows();
loadContacts().then((loadedContacts) => {
  contacts = loadedContacts;
  renderContacts();
}).catch(() => {
  contactList.innerHTML = '<div class="empty">Unable to load contacts.</div>';
});
