const STORAGE_KEY = "simple-address-book";
let contacts = [];
let editingId = null;

const searchInput = document.getElementById("searchInput");
const contactList = document.getElementById("contactList");
const contactForm = document.getElementById("contactForm");
const formTitle = document.getElementById("formTitle");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");

const fields = {
  name: document.getElementById("nameInput"),
  phone: document.getElementById("phoneInput"),
  email: document.getElementById("emailInput"),
  notes: document.getElementById("notesInput"),
};

function loadContacts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    contacts = saved ? JSON.parse(saved) : [];
  } catch {
    contacts = [];
  }
}

function saveContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function resetForm() {
  contactForm.reset();
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
    const text = `${contact.name} ${contact.phone} ${contact.email} ${contact.notes}`.toLowerCase();
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
          <div class="contact-meta">Phone: ${contact.phone}</div>
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

function saveContact(event) {
  event.preventDefault();

  const entry = {
    id: editingId || Date.now().toString(),
    name: fields.name.value.trim(),
    phone: fields.phone.value.trim(),
    email: fields.email.value.trim(),
    notes: fields.notes.value.trim(),
  };

  if (!entry.name || !entry.phone) {
    alert("Please add a name and phone number.");
    return;
  }

  if (editingId) {
    contacts = contacts.map((contact) => (contact.id === editingId ? entry : contact));
  } else {
    contacts.unshift(entry);
  }

  saveContacts();
  renderContacts();
  resetForm();
}

function startEditing(id) {
  const contact = contacts.find((item) => item.id === id);
  if (!contact) return;

  editingId = id;
  formTitle.textContent = "Edit Contact";
  fields.name.value = contact.name;
  fields.phone.value = contact.phone;
  fields.email.value = contact.email;
  fields.notes.value = contact.notes;
  openForm();
}

function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.getAttribute("data-id");
  const action = button.getAttribute("data-action");

  if (action === "edit") {
    startEditing(id);
  } else if (action === "delete") {
    contacts = contacts.filter((contact) => contact.id !== id);
    saveContacts();
    renderContacts();
  }
}

addBtn.addEventListener("click", openForm);
cancelBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderContacts);
contactForm.addEventListener("submit", saveContact);
contactList.addEventListener("click", handleListClick);

loadContacts();
renderContacts();
