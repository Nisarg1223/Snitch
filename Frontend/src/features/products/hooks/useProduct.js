import { useCallback } from "react";
import { createProduct, getSellerProduct, getAllProducts, getProductById } from "../services/product.api.js";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts } from "../state/product.slice.js";

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
        return data.product;
    }, []);

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetProducts,
        handleGetProductById
    };
};