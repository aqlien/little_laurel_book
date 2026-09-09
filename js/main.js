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

const phoneLabels = ["", "Home", "Work", "Mobile"];

function addPhoneRow(phone = { number: "", label: "" }) {
  const row = document.createElement("div");
  row.className = "phone-row";
  row.innerHTML = `
    <input class="phone-number" type="tel" placeholder="Phone number" value="${phone.number}" />
    <select class="phone-label" aria-label="Phone label">
      ${phoneLabels.map((label) => `<option value="${label}" ${label === phone.label ? "selected" : ""}>${label || "No label"}</option>`).join("")}
    </select>
    <button type="button" class="secondary remove-phone" aria-label="Remove phone number">Remove</button>
  `;
  phoneList.appendChild(row);
}

function getPhoneRows() {
  return [...phoneList.querySelectorAll(".phone-row")].map((row) => ({
    number: row.querySelector(".phone-number").value.trim(),
    label: row.querySelector(".phone-label").value,
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
  if (event.target.closest(".remove-phone")) {
    event.target.closest(".phone-row").remove();
  }
});

resetPhoneRows();
loadContacts().then(renderContacts).catch(() => {
  contactList.innerHTML = '<div class="empty">Unable to load contacts.</div>';
});
