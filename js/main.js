import { deleteContact, loadContacts, saveContact } from "./contact-store.js";
import { attachLabelPickerEvents, closeLabelPickers } from "./label-picker.js";
import { createContactList, filterContacts } from "./contact-list.js";
import { addressLabels, phoneLabels } from "./label-options.js";
import { createContactForm } from "./contact-form.js";
import { getContactValidationError } from "./contact-validation.js";

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

const form = createContactForm({ contactForm, formTitle, phoneList, addressList, fields });

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

form.resetRows();
loadContacts().then((loadedContacts) => {
  contacts = loadedContacts;
  renderContacts();
}).catch(() => {
  contactList.innerHTML = '<div class="empty">Unable to load contacts.</div>';
});
