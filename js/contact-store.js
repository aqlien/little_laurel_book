export async function loadContacts() {
  return window.electronApi.loadContacts();
}

export async function saveContact(contact) {
  return window.electronApi.saveContact(contact);
}

export async function deleteContact(id) {
  return window.electronApi.deleteContact(id);
}
