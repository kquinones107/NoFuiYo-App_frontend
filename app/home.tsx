import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ScrollView,  } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Avatar, IconButton, Menu  } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';
import Colors from '../src/constants/Colors';
import API from '../src/api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type Home = {
  _id: string;
  name: string;
  createdAt: string;
  // agrega aquí otras propiedades si las hay
};

export default function HomeScreen() {
  const router = useRouter();
  const { token, user } = useContext(AuthContext);
  type Stat = { name: string; points: number; completed: number; late: number };
  const [stats, setStats] = useState<Stat[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const res = await API.get('/home/mis-hogares', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHomes(res.data.homes);
      } catch (err) {
        console.error('Error al cargar hogares:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomes();
  }, []);

  const handleCreateHome = () => {
    router.push('/home-setup'); // o directamente abrir un modal si lo prefieres
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/stats/monthly', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data.stats);
      } catch (err) {
        console.error('Error al cargar estadísticas', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = {
    labels: stats.map((s) => s.name),
    datasets: [
      {
        data: stats.map((s) => s.points),
      },
    ],
  };

  const winner = stats.length > 0 ? stats[0] : null;

  const renderItem = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Title title={`🏡 ${item.name}`} subtitle={`Miembro desde: ${new Date(item.createdAt).toLocaleDateString()}`} />
      <Card.Actions>
        <Button onPress={() => router.push(`/tasks?homeId=${item._id}`)}>Ver tareas</Button>

        <Button
          mode="outlined"
          onPress={() => router.push('/history')}
        >
        Ver historial
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return <ActivityIndicator animating color={Colors.button} style={{ marginTop: 50 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text variant="titleLarge" style={styles.title}>Hola {user?.name}! 👋</Text>

      <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={openMenu}
            />
          }
        >
          <Menu.Item onPress={() => {closeMenu(); router.push('/menu/rulette'); }} title="🎡 Ruleta" />
          <Menu.Item onPress={() => {}} title="✏️ Editar perfil" />
          <Menu.Item onPress={() => {}} title="📄 Acerca de la app" />
          <Menu.Item onPress={() => {}} title="🔒 Políticas de privacidad" />
          <Menu.Item onPress={() => {}} title="🎉 Fechas especiales" />
          <Menu.Item onPress={() => {}} title="🚪 Cerrar sesión" />
        </Menu>
      </View>

      {homes.length < 5 && (
        <Card style={[styles.card, styles.createCard]} onPress={handleCreateHome}>
          <Card.Title title="➕ Crear nuevo hogar" />
        </Card>
      )}
      <View style={styles.section}>
      <Text style={styles.subtitle}>Tus hogares activos:</Text>

      <FlatList
        data={homes}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
      </View>
     
      <ScrollView style={styles.section2}>
      <Text style={styles.title}>Estadísticas del Mes</Text>

      {loading ? (
        <ActivityIndicator animating color={Colors.button} style={{ marginTop: 20 }} />
      ) : (
        <>
          <BarChart
            data={chartData}
            width={screenWidth - 30}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
              labelColor: () => Colors.textDark,
            }}
            style={{ marginVertical: 10, borderRadius: 8, alignSelf: 'center' }}
          />
          
          {winner && (
            <Card style={styles.card}>
              <Card.Title
                title="🏅 Integrante del Mes"
                subtitle={winner.name}
                left={(props) => <Avatar.Text {...props} label={winner.name.charAt(0)} />}
              />
              <Card.Content>
                <Text>{`Ha obtenido ${winner.points} punto(s) neto(s) este mes.`}</Text>
                <Text>{`Completadas: ${winner.completed}, Tarde: ${winner.late}`}</Text>
              </Card.Content>
            </Card>
          )}
        </>
      )}
      </ScrollView> 
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
    textAlign: 'center',
    marginBottom: 5,
    color: Colors.textDark,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 15,
    color: Colors.textDark,
  },
  card: {
    marginBottom: 15,
    backgroundColor: Colors.background,
  },
  createCard: {
    borderStyle: 'dashed',
    borderColor: Colors.grayMedium,
    borderWidth: 1,
  },
  section: {
  padding: 15,
  marginBottom: -30,
  borderRadius: 12,
},
  section2: {
    marginTop: 10,
  },
});
