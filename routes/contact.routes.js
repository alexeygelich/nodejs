const { Router } = require("express");
const {
  listContacts,
  validateCreateContact,
  addContact,
  validateContactID,
  removeContact,
  validateUpdateContact,
  updateContact,
  getById,
} = require("../controllers/contact.controller");

const router = Router();

router.get("/", listContacts);
router.get("/:contactId", validateContactID, getById);
router.post("/", validateCreateContact, addContact);
router.delete("/:contactId", validateContactID, removeContact);
router.patch("/:contactId", validateContactID, validateUpdateContact, updateContact);

module.exports = router;
