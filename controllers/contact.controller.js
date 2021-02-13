const {
  Types: { ObjectId },
} = require("mongoose");
const Contacts = require("../models/Contact");
const Joi = require("joi");

class ContactController {
  listContacts = async (req, res) => {
    const { sub, page, limit } = req.query;
    const options = page && limit ? { page, limit } : {};
    const subscription = sub ? { subscription: sub } : {};

    try {
      const { docs } = await Contacts.paginate(subscription, options);
      res.json(docs);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  addContact = async (req, res) => {
    try {
      const { body } = req;
      const newContact = await Contacts.create(body);
      res.status(201).json(newContact);
    } catch (err) {
      res.status(400).send(err);
    }
  };

  validateCreateContact(req, res, next) {
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

  updateContact = async (req, res) => {
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
  };

  validateUpdateContact(req, res, next) {
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

  validateContactID = (req, res, next) => {
    const { contactId } = req.params;

    if (!ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: "Your id is not valid" });
    }

    next();
  };

  removeContact = async (req, res) => {
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
  };

  getById = async (req, res) => {
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
  };
}

module.exports = new ContactController();
