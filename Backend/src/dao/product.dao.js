import productModel from '../models/product.model.js';

export const stockOfVariant = async (productId, variantId) => {
    try {
        const product = await productModel.findById(productId);
        if (!product) return 0;

        if (!variantId || variantId === "null" || variantId === "undefined") {
            return 999;
        }

        const variantsList = product.varients || product.variants || [];
        const variant = variantsList.find((v) => v._id && v._id.toString() === variantId.toString());

        return variant ? (Number(variant.stock) || 0) : 0;
    } catch (err) {
        console.error("Error in stockOfVariant:", err);
        return 0;
    }
};
