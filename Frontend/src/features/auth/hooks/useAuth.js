import { RegisterService, LoginService } from "../service/auth.api.js";
import { setUser, setLoading, setError } from "../state/auth.slice.js";
import { useDispatch, useSelector } from 'react-redux';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  async function handleRegister({ email, contact, password, fullname, isSeller = false}) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await RegisterService({
        email,
        contact,
        password,
        fullname,
        isSeller,
      });
      dispatch(setUser(data.user));
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message;
      dispatch(setError(errorMsg));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await LoginService({
        email,
        password
      });
      dispatch(setUser(data.user));
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message;
      dispatch(setError(errorMsg));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  return { handleRegister, handleLogin, user, loading, error };
}
