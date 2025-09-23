import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import API from '../api/axios';

export const AuthContext = createContext({} as any);

export const AuthProvider = ({ children }: any) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      await AsyncStorage.setItem('userToken', res.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));

      router.replace('/home'); // Redirigir a la pantalla de inicio después de iniciar sesión
    } catch (err) {
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
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
  try {
    const savedToken = await AsyncStorage.getItem('userToken');
    const savedUser = await AsyncStorage.getItem('userData');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  } catch (err) {
    console.error('Error cargando sesión:', err);
  }
};

  useEffect(() => {
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
