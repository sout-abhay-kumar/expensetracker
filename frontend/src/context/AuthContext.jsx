import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("smartspend_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("smartspend_token"))
      .finally(() => setLoading(false));
  }, []);
  async function signIn(credential) {
    const { data } = await api.post("/api/auth/google", { credential });
    localStorage.setItem("smartspend_token", data.access_token);
    setUser(data.user);
  }
  function signOut() {
    localStorage.removeItem("smartspend_token");
    setUser(null);
  }
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
