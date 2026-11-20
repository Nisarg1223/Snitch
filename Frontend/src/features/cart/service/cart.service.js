import axios from "axios";

const api = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
});

export const addItem = async ({ productId, variantId, quantity = 1 }) => {
    const url = (variantId && variantId !== "null" && variantId !== "undefined")
        ? `/add/${productId}/${variantId}`
        : `/add/${productId}`;

    const response = await api.post(url, {
        quantity
    });
    return response.data;
};

export const getCart = async () => {
    const response = await api.get("/");
    return response.data;
};

export const IncrementCartItemApi = async ({ productId, variantId }) => {
    const url = (variantId && variantId !== "null" && variantId !== "undefined")
        ? `/quantity/increment/${productId}/${variantId}`
        : `/quantity/increment/${productId}`;
    const response = await api.patch(url);
    return response.data;
};

export const DecrementCartItemApi = async ({ productId, variantId }) => {
    const url = (variantId && variantId !== "null" && variantId !== "undefined")
        ? `/quantity/decrement/${productId}/${variantId}`
        : `/quantity/decrement/${productId}`;

    const response = await api.patch(url);
    return response.data;
};