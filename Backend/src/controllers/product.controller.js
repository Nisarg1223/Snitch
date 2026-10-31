import mongoose from "mongoose";
import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
  const { title, description, priceAmount, priceCurrency } = req.body;
  const seller = req.user;
  const files = req.files || [];
  const images = await Promise.all(
    files.map(async (file) => {
      return await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      });
    })
  );

  const product = await productModel.create({
    title,
    description,
    price: {
      amount: priceAmount,
      currency: priceCurrency || "INR",
    },
    images,
    seller: seller._id,
  });

  res.status(201).json({
    message: "product created successfully",
    success: true,
    product,
  });
}

export async function getSellerProducts(req, res) {
  const seller = req.user;

  const products = await productModel.find({
    seller: seller._id,
  });

  res.status(200).json({
    success: true,
    message: "products fetched successfully",
    products,
  });
}

export async function getMe(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "not found",
    });
  }

  res.status(200).json({
    message: "Uer fetched successfully",
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullname: user.fullname,
      role: user.role,
    },
  });
}

export async function getAllProducts(req, res) {
  const products = await productModel.find();

  return res.status(200).json({
    message: "producys fetched successfully",
    success: true,
    products,
  });
}

export async function getProductDetails(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: "invalid product id",
      success: false,
    });
  }

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({
      message: "product not found",
      success: false,
    });
  }

  return res.status(200).json({
    message: "product fetch successfully",
    success: true,
    product,
  });
}

export async function addProductVariant(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
        success: false,
      });
    }

    const product = await productModel.findOne({
      _id: productId,
      seller: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
        success: false,
      });
    }

    const files = req.files || [];
    const images = [];

    if (files.length > 0) {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const image = await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
          });
          return { url: image.url };
        })
      );
      uploadedImages.forEach((img) => images.push(img));
    }

    if (req.body.existingImages) {
      try {
        const existing =
          typeof req.body.existingImages === "string"
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
        if (Array.isArray(existing)) {
          existing.forEach((img) => {
            const url = typeof img === "string" ? img : img?.url;
            if (url) images.push({ url });
          });
        }
      } catch (err) {
        console.error("Error parsing existingImages:", err);
      }
    }

    const priceAmount = req.body.priceAmount ?? req.body.price;
    const priceCurrency = req.body.priceCurrency || req.body.currency || product.price?.currency || "INR";
    const stock = req.body.stock !== undefined ? Number(req.body.stock) : 0;

    if (priceAmount === undefined || priceAmount === null || priceAmount === "" || isNaN(Number(priceAmount))) {
      return res.status(400).json({
        message: "Price amount is required and must be a number",
        success: false,
      });
    }

    let attributes = {};
    if (req.body.attributes) {
      if (typeof req.body.attributes === "string") {
        try {
          attributes = JSON.parse(req.body.attributes);
        } catch {
          attributes = {};
        }
      } else if (typeof req.body.attributes === "object") {
        attributes = req.body.attributes;
      }
    }

    const newVariant = {
      price: {
        amount: Number(priceAmount),
        currency: priceCurrency,
      },
      stock: Math.max(0, isNaN(stock) ? 0 : stock),
      attributes,
      images,
    };

    if (!Array.isArray(product.varients)) {
      product.varients = [];
    }

    product.varients.push(newVariant);
    await product.save();

    return res.status(201).json({
      message: "Variant added successfully",
      success: true,
      product,
      variant: product.varients[product.varients.length - 1],
    });
  } catch (error) {
    console.error("Error in addProductVariant:", error);
    return res.status(500).json({
      message: error.message || "Failed to add variant",
      success: false,
    });
  }
}
