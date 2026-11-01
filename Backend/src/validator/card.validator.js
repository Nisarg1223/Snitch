import {param,body,validationResult} from "express-validator";


const validateRequest = (req,res,next) =>{
    const errors = validateRequest(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors:errors.array()
        })
    }
    next();
}

export const validateAddToCart = [
    param("productId").isMongoId().withMessage("Invalid product Id"),
    param("variantId").optional().isMongoId().withMessage("Invalid variant Id"),
    body("quantity").optional().isInt({min:1}).withMessage("Quantity must be aleast 1 "),
    validateRequest
]