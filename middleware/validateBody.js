const { contactAddSchema, contactUpdateSchema } = require('../schemas/contacts.js')

function validateBody(req, res, next) {
  let response;
  
  if (req.method === 'POST') {
    response = contactAddSchema.validate(req.body, { abortEarly: false });
  } else {
    response = contactUpdateSchema.validate(req.body, { abortEarly: false });
  }
  

  let message = "";

  if (typeof response.error !== 'undefined') { 
    response.error.details.forEach((err, index) => {
      if (index === 0) {
        message += err.message
      } else {
        message += ', ' + err.message;
      }    
    });
    res.status(400).json({ message });
    return;
  }
  next();
}

module.exports = validateBody