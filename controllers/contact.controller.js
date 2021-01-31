const contacts = require("../models/Contact");
const Joi = require("joi");

class ContactController {
  listContacts = (req, res) => {
    res.json(contacts);
  };

  addContact = (req, res) => {
    const { body } = req;
    const arrayIndex = contacts.map(({ id }) => id);
    const index = Math.max(...arrayIndex) + 1;
    const createdContact = {
      ...body,
      id: index,
    };
    contacts.push(createdContact);
    res.status(201).json(createdContact);
  };

  validateCreateContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });

    const validationResult = validationRules.validate(req.body);

    if (validationResult.error) {
      return res.status(400).json({ message: "missing required name field" });
    }

    next();
  }

  findContactIndex = (contactId) => {
    const index = parseInt(contactId);
    return contacts.findIndex(({ id }) => id === index);
  };

  updateContact = (req, res) => {
    const {
      params: { contactId },
    } = req;

    const contactIndex = this.findContactIndex(contactId);

    const updateedUser = {
      ...contacts[contactIndex],
      ...req.body,
    };

    contacts[contactIndex] = updateedUser;

    res.json(updateedUser);
  };

  validateUpdateContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
    });

    const validationResult = validationRules.validate(req.body);

    if (validationResult.error) {
      return res.status(400).json({ message: "missing fields" });
    }

    next();
  }

  validateContactID = (req, res, next) => {
    const {
      params: { contactId },
    } = req;

    const contactIndex = this.findContactIndex(contactId);

    if (contactIndex === -1) {
      return res.status(404).json({ message: "Not found" });
    }
    next();
  };

  removeContact = (req, res) => {
    const {
      params: { contactId },
    } = req;

    const contactIndex = this.findContactIndex(contactId);

    contacts.splice(contactIndex, 1);

    res.json({ message: "contact deleted" });
  };

  getById = (req, res) => {
    const {
      params: { contactId },
    } = req;

    const getContact = contacts.find(({ id }) => +contactId === id);
    res.json(getContact);
  };
}

module.exports = new ContactController();
