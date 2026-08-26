import axios from 'axios';

const api = axios.create({
    baseURL:'http://localhost:3000/api/auth',
    withCredentials:true
})

export async function RegisterService({email,contact,password,fullname}){
     const response = await api.post('/register',{
        email,
        contact,
        password,
        fullname,
        isSeller
     })

     return response.data;
}