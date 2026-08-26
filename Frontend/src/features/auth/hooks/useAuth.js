import { RegisterService } from "../service/auth.api.js";
import { setUser, setLoading, setError } from "../state/auth.slice.js";
import {useDispatch} from 'react-redux';


export function useAuth() {

    const dispatch = useDispatch();

  async function handleRegister({ email, contact, password, fullname, isSeller = false}) {
    const data = await RegisterService({
      email,
      contact,
      password,
      fullname,
      isSeller,
    });

    dispatch(setUser(data.user));
  }

  return {handleRegister};
}
