const express = require('express')
const { validateBody, isValidId, missingFields, authenticate } = require('../../middlewares');

const router = express.Router()
const ctrl = require('../../controllers/contactsController');
const { contactAddSchema, contactUpdateSchema, updateFavoriteSchema } = require('../../models/contactModel');

router.get('/', authenticate, ctrl.getAll);

router.get('/:contactId', authenticate, isValidId, ctrl.getById);

router.post('/', authenticate, missingFields, validateBody(contactAddSchema), ctrl.addContact)

router.delete('/:contactId', authenticate, isValidId,  ctrl.deleteContactById)

router.put('/:contactId', authenticate, missingFields, isValidId, validateBody(contactUpdateSchema), ctrl.updateContactById)

router.patch('/:contactId/favorite', authenticate, missingFields, isValidId, validateBody(updateFavoriteSchema), ctrl.updateFavorite)

module.exports = router
