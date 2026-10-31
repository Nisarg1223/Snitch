import { useCallback } from "react";
import {
    createProduct,
    getSellerProduct,
    getAllProducts,
    getProductById,
    addProductVariant
} from "../services/product.api.js";
import { useDispatch } from "react-redux";
import {
    setSellerProducts,
    setProducts,
    setCurrentProduct,
    updateSellerProduct,
    addVariantToProduct
} from "../state/product.slice.js";

export const useProduct = () => {
    const dispatch = useDispatch();

    const handleCreateProduct = useCallback(async (formData) => {
        const data = await createProduct(formData);
        return data.product;
    }, []);

    const handleGetSellerProduct = useCallback(async () => {
        const data = await getSellerProduct();
        dispatch(setSellerProducts(data.products));
        return data.products;
    }, [dispatch]);

    const handleGetProducts = useCallback(async () => {
        const data = await getAllProducts();
        dispatch(setProducts(data.products));
        return data.products;
    }, [dispatch]);

    const handleGetProductById = useCallback(async (productId) => {
        const data = await getProductById(productId);
        if (data?.product) {
            dispatch(setCurrentProduct(data.product));
        }
        return data.product;
    }, [dispatch]);

    const handleAddProductVariant = useCallback(async (productId, variantData) => {
        const data = await addProductVariant(productId, variantData);
        if (data?.product) {
            dispatch(updateSellerProduct(data.product));
            dispatch(addVariantToProduct({ productId, variant: data.variant, product: data.product }));
        }
        return data;
    }, [dispatch]);

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetProducts,
        handleGetProductById,
        handleAddProductVariant,
        handleAddVariant: handleAddProductVariant
    };
};
