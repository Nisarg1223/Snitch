import axios from 'axios';


const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true
})

export async function createProduct(formData){
    const response = await productApiInstance.post("/",
        formData
    );
    return response.data;

}

export async function getSellerProduct(){
    const response = await productApiInstance.get("/seller");
    return response.data;
}

export async function getAllProducts(){
    const response = await productApiInstance.get("/");
    return response.data;
}