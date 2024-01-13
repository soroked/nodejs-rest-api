const express = require('express')
const { validateBody, isValidId, missingFields, missingFieldFavorite } = require('../../middlewares');

const router = express.Router()
const ctrl = require('../../controllers/contactsController');
const { contactAddSchema, contactUpdateSchema, updateFavoriteSchema } = require('../../models/contactModel');

router.get('/', ctrl.getAll);

router.get('/:contactId', isValidId, ctrl.getById);

router.post('/', validateBody(contactAddSchema), ctrl.addContact)

router.delete('/:contactId', isValidId,  ctrl.deleteContactById)

router.put('/:contactId', missingFields, isValidId, validateBody(contactUpdateSchema), ctrl.updateContactById)

router.patch('/:contactId/favorite', missingFieldFavorite, isValidId, validateBody(updateFavoriteSchema), ctrl.updateFavorite)

module.exports = router
