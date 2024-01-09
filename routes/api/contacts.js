const express = require('express')
const validateBody = require('../../middlewares/validateBody.js');
const { contactAddSchema, contactUpdateSchema } = require('../../schemas/contacts.js');
const router = express.Router()
const ctrl = require('../../controllers/contacts');

router.get('/', ctrl.getAll);

router.get('/:contactId', ctrl.getById);

router.post('/', validateBody(contactAddSchema), ctrl.addContactById)

router.delete('/:contactId', ctrl.deleteContactById)

router.put('/:contactId', validateBody(contactUpdateSchema), ctrl.updateContactById)

module.exports = router
