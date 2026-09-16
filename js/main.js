import { deleteContact, loadContacts, saveContact } from "./contact-store.js";
import { attachLabelPickerEvents, closeLabelPickers } from "./label-picker.js";
import { createContactList, filterContacts } from "./contact-list.js";
import { addressLabels, dateLabels, numberLabels, phoneLabels } from "./label-options.js";
import { createContactForm } from "./contact-form.js";
import { getContactValidationError } from "./contact-validation.js";
import { registerDateLabels } from "./date-fields.js";
import { registerNumberLabels } from "./number-fields.js";

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
const addDateBtn = document.getElementById("addDateBtn");
const addNumberBtn = document.getElementById("addNumberBtn");
const phoneList = document.getElementById("phoneList");
const addressList = document.getElementById("addressList");
const dateList = document.getElementById("dateList");
const numberList = document.getElementById("numberList");

const fields = {
  name: document.getElementById("nameInput"),
  email: document.getElementById("emailInput"),
  notes: document.getElementById("notesInput"),
};

const form = createContactForm({ contactForm, formTitle, phoneList, addressList, dateList, numberList, fields });

function resetForm() {
  form.reset();
  editingId = null;
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
    ...form.getContactValues(),
  };

  const validationError = getContactValidationError(entry);
  if (validationError) {
    alert(validationError);
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
  form.populate(contact);
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
addPhoneBtn.addEventListener("click", () => form.addPhoneRow());
addAddressBtn.addEventListener("click", () => form.addAddressRow());
addDateBtn.addEventListener("click", () => form.addDateRow());
addNumberBtn.addEventListener("click", () => form.addNumberRow());
cancelBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderContacts);
contactForm.addEventListener("submit", saveContactForm);
contactList.addEventListener("click", handleListClick);
attachLabelPickerEvents(phoneList, phoneLabels, "phone");
attachLabelPickerEvents(addressList, addressLabels, "address");
attachLabelPickerEvents(dateList, dateLabels, "date");
attachLabelPickerEvents(numberList, numberLabels, "number");
phoneList.addEventListener("click", (event) => {
  if (event.target.closest(".remove-phone")) event.target.closest(".phone-row").remove();
});
addressList.addEventListener("click", (event) => {
  if (event.target.closest(".remove-address")) event.target.closest(".address-row").remove();
});
dateList.addEventListener("click", (event) => {
  if (event.target.closest(".remove-date")) event.target.closest(".date-row").remove();
});
numberList.addEventListener("click", (event) => {
  if (event.target.closest(".remove-number")) event.target.closest(".number-row").remove();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".type-label-picker")) closeLabelPickers();
});

form.resetRows();
loadContacts().then((loadedContacts) => {
  loadedContacts.forEach((contact) => registerDateLabels(contact.dates || []));
  loadedContacts.forEach((contact) => registerNumberLabels(contact.numbers || []));
  contacts = loadedContacts;
  renderContacts();
}).catch(() => {
  contactList.innerHTML = '<div class="empty">Unable to load contacts.</div>';
});
