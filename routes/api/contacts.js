const express = require('express')
const { listContacts, getContactById, removeContact, addContact, updateContact } = require('../../models/contacts')

const validateBody = require('../../middleware/validateBody.js')

const router = express.Router()

router.get('/', async (req, res, next) => {
  const contacts = await listContacts();
  res.status(200).json(contacts);
})

router.get('/:contactId', async (req, res, next) => {
  const contact = await getContactById(req.params.contactId)
  contact ? res.status(200).json(contact) : res.status(404).json({ message: 'Not found'})
})

router.post('/', validateBody, async (req, res, next) => {
  const newContact = await addContact(req.body);
  res.status(201).json(newContact)
})

router.delete('/:contactId', async (req, res, next) => {
  const removedContact = await removeContact(req.params.contactId);
  removedContact ? res.status(200).json({ message: 'contact deleted'}) : res.status(404).json({ message: 'Not found' });
})

router.put('/:contactId', validateBody, async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: 'template message' })
    return;
  }

  const updatedContact = await updateContact(req.params.contactId, req.body);

  if (updatedContact === null) {
    res.status(404).json({ message: 'Not Found' });
    return;
  }

  res.status(200).json(updatedContact);
})

module.exports = router
