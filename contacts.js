const fs = require("fs").promises;
const path = require("path");

const contactsPath = path.join("./db", "/contacts.json");
// TODO: задокументировать каждую функцию
async function listContacts() {
  let listContact;

  try {
    listContact = await fs.readFile(contactsPath, "utf-8");
  } catch (error) {
    console.log(error);
  }

  const listContactArr = JSON.parse(listContact.toString());
  console.table(listContactArr);

  return listContactArr;
}

async function getContactById(contactId) {
  const listContact = await listContacts();
  const contact = listContact.find((contact) => contact.id === contactId);
  console.table(contact);
}

async function removeContact(contactId) {
  const listContact = await listContacts();
  const listContactFiltered = listContact.filter((contact) => contact.id !== contactId);
  await wrightToFile(listContactFiltered);
  await listContacts();
}

async function addContact(name, email, phone) {
  const listContact = await listContacts();
  const getIds = listContact.map((contact) => contact.id);
  let id = 0;
  for (let i of getIds) {
    if (i > id) id = i;
  }
  id++;
  listContact.push({ id, name, email, phone });
  await wrightToFile(listContact);
  await listContacts();
}

async function wrightToFile(array) {
  const arrayStr = JSON.stringify(array);
  await fs.writeFile(contactsPath, arrayStr, (err) => {
    if (err) console.log("err ", err);
  });
}

module.exports = {
  listContacts,
  removeContact,
  addContact,
  getContactById,
};
