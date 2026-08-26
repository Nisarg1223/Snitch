import {body,validationResult} from 'express-validator';

function validateRequest(req,res,next){
   const errors = validationResult(req);

   if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
   }

    next();
}

export const validateRegisterUser = [
    body("email").isEmail().withMessage("invalid email formate"),
    body("contact")
    .notEmpty().withMessage("contact is required")
    .matches(/^\d{10}$/).withMessage("the contact number should contain 10 digits"),
    body("password")
    .isLength({min:6}).withMessage("the password should be at least 6 characters long."),
    body("fullname")
    .isEmpty().withMessage("the full name is required")
    .isLength({min:3}).withMessage("the fullname must be at least 3 character long"),
     body("isSeller")
     .isBoolean().withMessage("the seller should be in the  boolean"),
     
    validateRequest
]