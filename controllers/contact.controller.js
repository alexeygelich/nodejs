const {
  Types: { ObjectId },
} = require("mongoose");
const Contacts = require("../models/Contact");
const Joi = require("joi");

async function listContacts(req, res) {
  const { sub, page, limit } = req.query;
  const options = page && limit ? { page, limit } : {};
  const subscription = sub ? { subscription: sub } : {};

  try {
    const { docs } = await Contacts.paginate(subscription, options);
    res.json(docs);
  } catch (error) {
    res.status(400).send(error);
  }
}

async function addContact(req, res) {
  try {
    const { body } = req;
    const newContact = await Contacts.create(body);
    res.status(201).json(newContact);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function validateCreateContact(req, res, next) {
  const validationRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    subscription: Joi.string().required(),
    password: Joi.string().required(),
  });

  const validationResult = validationRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).json({ message: "missing required name field" });
  }

  next();
}

async function updateContact(req, res) {
  try {
    const { contactId } = req.params;
    const { body } = req;
    const updatedContact = await Contacts.findByIdAndUpdate(contactId, body, {
      new: true,
    });

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(updatedContact);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function validateUpdateContact(req, res, next) {
  const validationRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    subscription: Joi.string(),
    password: Joi.string(),
  }).min(1);

  const validationResult = validationRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).json({ message: "field format need to be a string" });
  }

  next();
}

async function validateContactID(req, res, next) {
  const { contactId } = req.params;

  if (!ObjectId.isValid(contactId)) {
    return res.status(400).json({ message: "Your id is not valid" });
  }

  next();
}

async function removeContact(req, res) {
  const { contactId } = req.params;
  try {
    const deletedContact = await Contacts.findByIdAndDelete(contactId);
    if (deletedContact) {
      return res.status(200).json({ message: "contact deleted" });
    }
    res.status(404).json({ message: "Not found" });
  } catch (err) {
    res.status(400).send(err);
  }
}

async function getById(req, res) {
  const { contactId } = req.params;
  try {
    const getContact = await Contacts.findById(contactId);

    if (getContact) {
      res.json(getContact);
    }
    return res.status(404).json({ message: "Not found" });
  } catch (err) {
    res.status(400).send(err);
  }
}

module.exports = {
  listContacts,
  validateCreateContact,
  addContact,
  validateContactID,
  removeContact,
  validateUpdateContact,
  updateContact,
  getById,
};
