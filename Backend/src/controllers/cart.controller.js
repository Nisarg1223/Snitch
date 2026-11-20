import mongoose from 'mongoose';
import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';
import { stockOfVariant } from '../dao/product.dao.js';

export const addToCart = async (req, res) => {
    try {
        const productId = req.params.productId || req.body.productId;
        let variantId = req.params.variantId || req.body.variantId;
        if (!variantId || variantId === "null" || variantId === "undefined") {
            variantId = null;
        }

        const quantity = Math.max(1, Number(req.body.quantity) || 1);

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
                success: false
            });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "product not found",
                success: false
            });
        }

        let variant = null;
        if (variantId) {
            const variantsList = product.varients || product.variants || [];
            variant = variantsList.find((v) => v._id && v._id.toString() === variantId.toString());
            if (!variant) {
                return res.status(404).json({
                    message: "variant not found on this product",
                    success: false
                });
            }
        }

        const stock = await stockOfVariant(productId, variantId);

        let cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            cart = await cartModel.create({ user: req.user._id, items: [] });
        }

        const isProductAlreadyInCart = cart.items.find((item) => {
            const matchesProduct = item.product.toString() === productId.toString();
            const matchesVariant = variantId
                ? item.variant?.toString() === variantId.toString()
                : !item.variant;
            return matchesProduct && matchesVariant;
        });

        if (isProductAlreadyInCart) {
            const quantityInCart = Number(isProductAlreadyInCart.quantity) || 0;
            if (quantityInCart + quantity > stock) {
                return res.status(400).json({
                    message: `Only ${stock} items left in stock and you already have ${quantityInCart} in your cart`,
                    success: false
                });
            }

            isProductAlreadyInCart.quantity = quantityInCart + quantity;
            await cart.save();

            const updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");
            return res.status(200).json({
                message: "Cart updated successfully",
                success: true,
                cart: updatedCart
            });
        }

        if (quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock`,
                success: false
            });
        }

        const itemPrice = variant?.price || product.price || { amount: 0, currency: "INR" };

        cart.items.push({
            product: productId,
            variant: variantId || undefined,
            quantity,
            price: {
                amount: Number(itemPrice.amount) || 0,
                currency: itemPrice.currency || "INR"
            }
        });
        await cart.save();

        const updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");
        return res.status(200).json({
            message: "product added in cart successfully",
            success: true,
            cart: updatedCart
        });
    } catch (err) {
        console.error("Error in addToCart:", err);
        return res.status(500).json({
            message: err.message || "Failed to add product to cart",
            success: false
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const user = req.user;

        let cart = await cartModel.findOne({
            user: user._id
        }).populate("items.product");

        if (!cart) {
            cart = await cartModel.create({
                user: user._id,
                items: []
            });
        }

        return res.status(200).json({
            message: "cart fetched successfully",
            success: true,
            cart
        });
    } catch (err) {
        console.error("Error in getCart:", err);
        return res.status(500).json({
            message: err.message || "Failed to fetch cart",
            success: false
        });
    }
};

export const IncrementCartItemQuantity = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const hasVariant = Boolean(variantId && variantId !== "null" && variantId !== "undefined");

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "product not found",
                success: false
            });
        }

        const cart = await cartModel.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                message: "cart not found",
                success: false
            });
        }

        const stock = await stockOfVariant(productId, hasVariant ? variantId : null);

        const itemInCart = cart.items.find((item) => {
            if (hasVariant) {
                return item.product.toString() === productId && item.variant?.toString() === variantId.toString();
            }
            return item.product.toString() === productId && !item.variant;
        });

        if (!itemInCart) {
            return res.status(404).json({
                message: "Item not found in cart",
                success: false
            });
        }

        const itemQuantityInCart = itemInCart.quantity || 0;

        if (itemQuantityInCart + 1 > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock, and you already have ${itemQuantityInCart} in your cart`,
                success: false
            });
        }

        itemInCart.quantity = itemQuantityInCart + 1;
        await cart.save();

        const updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

        return res.status(200).json({
            message: "Cart item quantity incremented successfully",
            success: true,
            cart: updatedCart
        });
    } catch (err) {
        console.error("Error in IncrementCartItemQuantity:", err);
        return res.status(500).json({
            message: err.message || "Failed to increment cart item quantity",
            success: false
        });
    }
};
export const DecrementCartItemQuantity = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const hasVariant = Boolean(variantId && variantId !== "null" && variantId !== "undefined");

        // 1. Verify the product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            });
        }

        // 2. Find the user's cart
        const cart = await cartModel.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            });
        }

        // 3. Locate the item in the cart (handling both variant & non-variant products)
        const itemInCart = cart.items.find((item) => {
            if (hasVariant) {
                return item.product.toString() === productId && item.variant?.toString() === variantId.toString();
            }
            return item.product.toString() === productId && !item.variant;
        });

        if (!itemInCart) {
            return res.status(404).json({
                message: "Item not found in cart",
                success: false
            });
        }

        // 4. Condition check: minimum quantity must be 1 (cannot decrement below 1)
        if (itemInCart.quantity <= 1) {
            return res.status(400).json({
                message: "Quantity cannot be less than 1",
                success: false
            });
        }

        // 5. Decrement quantity by 1 and save
        itemInCart.quantity -= 1;
        await cart.save();

        // 6. Return populated cart
        const updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

        return res.status(200).json({
            message: "Cart item quantity decremented successfully",
            success: true,
            cart: updatedCart
        });
    } catch (err) {
        console.error("Error in DecrementCartItemQuantity:", err);
        return res.status(500).json({
            message: err.message || "Failed to decrement cart item quantity",
            success: false
        });
    }
};