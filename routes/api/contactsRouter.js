const express = require('express')
const { validateBody, isValidId, missingFields } = require('../../middlewares');

const router = express.Router()
const ctrl = require('../../controllers/contactsController');
const { contactAddSchema, contactUpdateSchema, updateFavoriteSchema } = require('../../models/contactModel');

router.get('/', ctrl.getAll);

router.get('/:contactId', isValidId, ctrl.getById);

router.post('/', validateBody(contactAddSchema), ctrl.addContact)

router.delete('/:contactId', isValidId,  ctrl.deleteContactById)

router.put('/:contactId', missingFields, isValidId, validateBody(contactUpdateSchema), ctrl.updateContactById)

router.patch('/:contactId/favorite', isValidId, validateBody(updateFavoriteSchema), ctrl.updateFavorite)

module.exports = router
