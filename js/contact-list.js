export function filterContacts(contacts, searchTerm) {
  const term = String(searchTerm || "").trim().toLowerCase();
  return contacts.filter((contact) => {
    const phoneText = (contact.phones || []).map((phone) => `${phone.number || ""} ${phone.label || ""}`).join(" ");
    const addressText = (contact.addresses || []).map((address) => `${formatAddress(address)} ${address.label || ""}`).join(" ");
    const dateText = (contact.dates || []).map((date) => `${date.date || ""} ${date.label || ""}`).join(" ");
    const numberText = (contact.numbers || []).map((number) => `${number.number || ""} ${number.label || ""}`).join(" ");
    const searchableText = [contact.name, phoneText, addressText, dateText, numberText, contact.email, contact.notes]
      .filter((value) => value != null)
      .join(" ")
      .toLowerCase();
    return searchableText.includes(term);
  });
}

export function formatAddress(address) {
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.postalCode, address.country].filter(Boolean).join(" "),
  ].filter(Boolean).join(", ");
}

export function createContactList(contacts) {
  if (contacts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No contacts yet.";
    return [empty];
  }

  return contacts.map(createContactCard);
}

function createContactCard(contact) {
  const card = document.createElement("div");
  card.className = "contact-card";
  appendText(card, "div", "contact-name", contact.name);

  (contact.phones || []).forEach((phone) => {
    appendText(card, "div", "contact-meta", `Phone${phone.label ? ` (${phone.label})` : ""}: ${phone.number}`);
  });
  (contact.addresses || []).forEach((address) => {
    appendText(card, "div", "contact-meta", `Address${address.label ? ` (${address.label})` : ""}: ${formatAddress(address)}`);
  });
  (contact.dates || []).forEach((date) => {
    appendText(card, "div", "contact-meta", `Date${date.label ? ` (${date.label})` : ""}: ${date.date}`);
  });
  (contact.numbers || []).forEach((number) => {
    appendText(card, "div", "contact-meta", `Number${number.label ? ` (${number.label})` : ""}: ${number.number}`);
  });
  appendText(card, "div", "contact-meta", `Email: ${contact.email || "—"}`);
  appendText(card, "div", "contact-meta", `Notes: ${contact.notes || "—"}`);

  const actions = document.createElement("div");
  actions.className = "contact-actions";
  actions.append(createActionButton("edit", contact.id, "Edit"), createActionButton("delete", contact.id, "Delete"));
  card.appendChild(actions);
  return card;
}

function appendText(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.appendChild(element);
}

function createActionButton(action, id, text) {
  const button = document.createElement("button");
  button.dataset.action = action;
  button.dataset.id = id;
  button.textContent = text;
  return button;
}
