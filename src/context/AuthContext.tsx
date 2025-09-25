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

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      await AsyncStorage.setItem('userToken', res.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));

      // Save credentials if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        // Clear saved credentials if remember me is unchecked
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
        await AsyncStorage.removeItem('rememberMe');
      }

      router.replace('/home'); // Redirigir a la pantalla de inicio después de iniciar sesión
    } catch (err) {
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, rememberMe: boolean = false) => {
    try {
      await API.post('/auth/register', { name, email, password });
      await login(email, password, rememberMe);
    } catch (err) {
      Alert.alert('Error', 'No se pudo registrar');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
    setToken(null);
  };

  const loadSavedCredentials = async () => {
    try {
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      if (rememberMe === 'true') {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        return { email: savedEmail || '', password: savedPassword || '', rememberMe: true };
      }
      return { email: '', password: '', rememberMe: false };
    } catch (err) {
      console.error('Error loading saved credentials:', err);
      return { email: '', password: '', rememberMe: false };
    }
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
    <AuthContext.Provider value={{ user, token, login, register, logout, setUser, isLoading, loadSavedCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};
