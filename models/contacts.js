const fs = require('fs/promises')
const path = require('path')
const { randomBytes } = require('node:crypto');

const contactsPath = path.join(__dirname, 'contacts.json');

async function readContacts() {
  const contacts = await fs.readFile(contactsPath, { encoding: 'utf8' });
  return JSON.parse(contacts);
}

function writeContacts(contacts) {
  fs.writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));
}

const listContacts = async () => {
  return await readContacts();
}

const getContactById = async (contactId) => {
  const contacts = await readContacts();

  return contacts.find(contact => contact.id === contactId) ?? null;
}

const removeContact = async (contactId) => {
  const contacts = await readContacts();

  const removedContactIndex = contacts.findIndex(contact => contact.id === contactId);

  if (removedContactIndex === -1) return null;

  const newContacts = [
    ...contacts.slice(0, removedContactIndex),
    ...contacts.slice(removedContactIndex + 1)
  ];

  writeContacts(newContacts);

  return contacts[removedContactIndex];
}

const addContact = async (body) => {
  const newContact = {
    ...body,
    id: randomBytes(10).toString('hex'),
  }

  const contacts = await readContacts();
  contacts.unshift(newContact);
  writeContacts(contacts);

  return newContact;
}

const updateContact = async (contactId, body) => {
  const contacts = await readContacts();
  const contact = contacts.find(contact => contact.id === contactId) ?? null;

  if (contact === null) return null;

  const index = contacts.findIndex(contact => contact.id === contactId);

  const updatedContact = {
    ...contact,
    ...body,
  }

  contacts[index] = updatedContact;
  writeContacts(contacts);

  return updatedContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
