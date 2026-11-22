import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

function validateRequest(req,res,next){
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            message:"Validation error",
            errors:errors.array()
        });
    }
    next();
}
export const createProductValidator = [
    body("title").notEmpty().withMessage("title is required"),
    body("description").notEmpty().withMessage("description is required"),
    body("priceAmount").notEmpty().withMessage("price amount must be a number"),
    body("priceCurrency").notEmpty().withMessage("price currency is required"),
    validateRequest
]
export const updateProductValidator = [
    param("productId").custom((val) => {
        if (!val || !mongoose.isValidObjectId(val)) {
            throw new Error("Invalid product ID");
        }
        return true;
    }),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
    body("priceAmount").optional().isNumeric().withMessage("Price amount must be a valid number"),
    validateRequest
];