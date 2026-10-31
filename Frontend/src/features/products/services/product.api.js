import axios from 'axios';

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true
});

export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData);
    return response.data;
}

export async function getSellerProduct() {
    const response = await productApiInstance.get("/seller");
    return response.data;
}

export async function getAllProducts() {
    const response = await productApiInstance.get("/");
    return response.data;
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/detail/${productId}`);
    return response.data;
}

export async function addProductVariant(productId, variantData) {
    let payload = variantData;

    // Support passing either a prepared FormData instance or a plain object
    if (!(variantData instanceof FormData)) {
        const formData = new FormData();
        if (variantData.priceAmount !== undefined) formData.append("priceAmount", variantData.priceAmount);
        if (variantData.priceCurrency !== undefined) formData.append("priceCurrency", variantData.priceCurrency);
        if (variantData.stock !== undefined) formData.append("stock", variantData.stock);
        if (variantData.attributes !== undefined) {
            formData.append(
                "attributes",
                typeof variantData.attributes === "string"
                    ? variantData.attributes
                    : JSON.stringify(variantData.attributes)
            );
        }
        if (variantData.images && Array.isArray(variantData.images)) {
            variantData.images.forEach((img) => {
                if (img instanceof File || img instanceof Blob) {
                    formData.append("images", img);
                }
            });
        }
        if (variantData.existingImages) {
            formData.append(
                "existingImages",
                typeof variantData.existingImages === "string"
                    ? variantData.existingImages
                    : JSON.stringify(variantData.existingImages)
            );
        }
        payload = formData;
    }

    const response = await productApiInstance.post(`/${productId}/variants`, payload);
    return response.data;
}
