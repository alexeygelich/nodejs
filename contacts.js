const fs = require("fs").promises;
const path = require("path");

const contactsPath = path.join("./db", "/contacts.json");
// TODO: задокументировать каждую функцию
function listContacts() {
  return fs
    .readFile(contactsPath, "utf-8")
    .then((data) => {
      console.table(JSON.parse(data.toString()));
      return data.toString();
    })
    .catch((err) => console.log("err ", err));
}

async function getContactById(contactId) {
  const listContact = await listContacts();
  const listContactArr = JSON.parse(listContact);
  const contact = listContactArr.find((contact) => contact.id === contactId);
  console.table(contact);
  return contact;
}

async function removeContact(contactId) {
  const listContact = await listContacts();
  const listContactArr = JSON.parse(listContact);
  const listContactFiltered = listContactArr.filter((contact) => contact.id !== contactId);
  wrightToFile(listContactFiltered);
  listContacts();
}

async function addContact(name, email, phone) {
  const listContact = await listContacts();
  const listContactArr = JSON.parse(listContact);
  const getIds = listContactArr.map((contact) => contact.id);
  let id = 0;
  for (let i of getIds) {
    if (i > id) id = i;
  }
  id++;
  listContactArr.push({ id, name, email, phone });
  wrightToFile(listContactArr);
  listContacts();
}

function wrightToFile(array) {
  const arrayStr = JSON.stringify(array);
  fs.writeFile(contactsPath, arrayStr, (err) => {
    if (err) console.log("err ", err);
  });
}

module.exports = {
  listContacts,
  removeContact,
  addContact,
  getContactById,
};
