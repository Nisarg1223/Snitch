import { param, body, validationResult } from "express-validator";
import mongoose from "mongoose";

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    next();
};

export const validateAddToCart = [
    param("productId").isMongoId().withMessage("Invalid product Id"),
    param("variantId").optional().custom((val) => {
        if (!val || val === "null" || val === "undefined") return true;
        if (!mongoose.isValidObjectId(val)) throw new Error("Invalid variant Id");
        return true;
    }),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    validateRequest
];

export const validateIncrementCartItemQuantity = [
    param("productId").isMongoId().withMessage("invalide product id"),
    param("variantId").optional().isMongoId().withMessage("invalide variant id"),
    validateRequest
]