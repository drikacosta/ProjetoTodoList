import React, { createContext, useState } from 'react';
import { auth } from '../services/firebase';

export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    setUser(userCredential.user);
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
