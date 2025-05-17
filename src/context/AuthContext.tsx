import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import API from '../api/axios';

export const AuthContext = createContext({} as any);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      await AsyncStorage.setItem('userToken', res.data.token);
    } catch (err) {
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await API.post('/auth/register', { name, email, password });
      await login(email, password);
    } catch (err) {
      Alert.alert('Error', 'No se pudo registrar');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUser(null);
    setToken(null);
  };

  const loadToken = async () => {
    const savedToken = await AsyncStorage.getItem('userToken');
    if (savedToken) {
      setToken(savedToken);
      // podrías validar o cargar user aquí si lo necesitas
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
