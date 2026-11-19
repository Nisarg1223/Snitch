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

export const IncrementCartItem = async({productId,variantId})=>{
   const response = await api.patch(`/quantity/increment/${productId}/${variantId}`);
   return response.data
}
