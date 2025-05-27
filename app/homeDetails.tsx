import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Clipboard, Alert } from 'react-native';
import { Text, Card, Button, IconButton } from 'react-native-paper';
import { AuthContext } from '../src/context/AuthContext';
import API from '../src/api/axios';
import Colors from '../src/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeDetailsScreen() {
  const { token } = useContext(AuthContext);
  const [home, setHome] = useState<any>(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await API.get('/home/members', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data.members);
        if (res.data.members.length > 0) {
          setHome(res.data.home); // asumiendo que 'home' viene en cada miembro
        }
      } catch (err) {
        Alert.alert('Error', 'No se pudo cargar la información del hogar');
      }
    };

    fetchHome();
  }, []);

  const copyCode = () => {
    Clipboard.setString(home?.code || '');
    Alert.alert('Código copiado', 'El código del hogar ha sido copiado al portapapeles');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🏠 Detalles del Hogar</Text>
      {home && (
        <Card style={styles.card}>
          <Card.Title title={home.name} subtitle={`Código de ingreso: ${home.code}`} />
          <Card.Actions>
            <Button onPress={copyCode} icon="content-copy">Copiar Código</Button>
          </Card.Actions>
        </Card>
      )}

      <Text style={styles.subtitle}>👥 Miembros</Text>
      {members.map((member: any, index: number) => (
        <Card key={index} style={styles.memberCard}>
          <Card.Title title={member.name} subtitle={member.email} />
        </Card>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
    color: Colors.textDark,
  },
  card: {
    marginBottom: 20,
  },
  memberCard: {
    marginBottom: 10,
  },
});
