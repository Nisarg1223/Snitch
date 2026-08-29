import axios from 'axios';

const api = axios.create({
    baseURL:'/api/auth',
    withCredentials:true
})

export async function RegisterService({ email, contact, password, fullname, isSeller }) {
     const response = await api.post('/register', {
        email,
        contact,
        password,
        fullname,
        isSeller
     });

     return response.data;
}


export async function LoginService({email,password}){
    const response = await api.post('/login',{
        email,
        password
    })

    return response.data;
}