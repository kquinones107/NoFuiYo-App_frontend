import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ActivityIndicator, Avatar, Button, Card, Chip, IconButton, Menu, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/axios';
import { AuthContext } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

type Home = {
  _id: string;
  name: string;
  createdAt: string;
  // agrega aquí otras propiedades si las hay
};

export default function HomeScreen() {
  const router = useRouter();
  const { token, user, logout } = useContext(AuthContext);
  const { colors, toggleTheme, isDark } = useTheme();
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
  }, [token]);

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
  }, [token]);

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
    <Card style={[styles.homeCard, { backgroundColor: colors.cardBackground }]} elevation={2}>
      <Card.Content style={styles.homeCardContent}>
        <View style={styles.homeCardHeader}>
          <View style={styles.homeInfo}>
            <Text variant="headlineSmall" style={[styles.homeName, { color: colors.textPrimary }]}>
              🏡 {item.name}
            </Text>
            <Text variant="bodyMedium" style={[styles.homeSubtitle, { color: colors.textSecondary }]}>
              Miembro desde: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <IconButton
            icon="information-outline"
            size={20}
            onPress={() => router.push('/homeDetails')}
            iconColor={colors.primary}
          />
        </View>
        
        <View style={styles.homeActions}>
          <Button 
            mode="contained" 
            onPress={() => router.push(`/tasks?homeId=${item._id}`)}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            contentStyle={styles.actionButtonContent}
          >
            Ver tareas
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/history')}
            style={[styles.secondaryActionButton, { borderColor: colors.primary }]}
            contentStyle={styles.actionButtonContent}
          >
            Ver historial
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating color={colors.primary} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header with gradient */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text variant="headlineMedium" style={styles.greeting}>
              ¡Hola {user?.name}! 👋
            </Text>
            <Text variant="bodyMedium" style={styles.greetingSubtitle}>
              Bienvenido de vuelta a NoFuiYo
            </Text>
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={openMenu}
                iconColor={colors.buttonText}
              />
            }
          >
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/rulette'); }} title="🎡 Ruleta" />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/editProfile'); }} title="✏️ Editar perfil" />
            <Menu.Item onPress={() => {closeMenu(); toggleTheme(); }} title={isDark ? "☀️ Modo claro" : "🌙 Modo oscuro"} />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/aboutApp'); }} title="📄 Acerca de la app" />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/privacyPolicy');}} title="🔒 Políticas de privacidad" />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/specialDate');}} title="🎉 Fechas especiales" />
            <Menu.Item
             onPress={() => {
             closeMenu();
             logout(); // Cierra la sesión
             router.replace('/login'); // Redirige a la pantalla principal o login
            }}
            title="🚪 Cerrar sesión"
            />
          </Menu>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {homes.length < 5 && (
          <Card style={[styles.createCard, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]} onPress={handleCreateHome} elevation={2}>
            <Card.Content style={styles.createCardContent}>
              <Text variant="headlineSmall" style={[styles.createCardTitle, { color: colors.primary }]}>
                ➕ Crear nuevo hogar
              </Text>
              <Text variant="bodyMedium" style={[styles.createCardSubtitle, { color: colors.textSecondary }]}>
                Establece un nuevo hogar para tu familia
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tus hogares activos</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Gestiona y organiza las tareas de tu hogar
          </Text>

          <FlatList
            data={homes}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.homesList}
          />
        </View>
        <View style={styles.statsSection}>
          <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>📊 Estadísticas del Mes</Text>
          <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
            Rendimiento y logros de tu equipo
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando estadísticas...</Text>
            </View>
          ) : (
            <>
              <Card style={[styles.chartCard, { backgroundColor: colors.cardBackground }]} elevation={2}>
                <Card.Content>
                  <BarChart
                    data={chartData}
                    width={screenWidth - 60}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: colors.cardBackground,
                      backgroundGradientFrom: colors.cardBackground,
                      backgroundGradientTo: colors.cardBackground,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                      labelColor: () => colors.textPrimary,
                    }}
                    style={{ marginVertical: 10, borderRadius: 8, alignSelf: 'center' }}
                  />
                </Card.Content>
              </Card>
              
              {winner && (
                <Card style={[styles.winnerCard, { backgroundColor: colors.cardBackground, borderColor: colors.highlight }]} elevation={3}>
                  <Card.Content style={styles.winnerContent}>
                    <View style={styles.winnerHeader}>
                      <Avatar.Text 
                        size={50} 
                        label={winner.name.charAt(0)} 
                        style={[styles.winnerAvatar, { backgroundColor: colors.highlight }]}
                      />
                      <View style={styles.winnerInfo}>
                        <Text variant="headlineSmall" style={[styles.winnerTitle, { color: colors.textPrimary }]}>
                          🏅 Integrante del Mes
                        </Text>
                        <Text variant="titleMedium" style={[styles.winnerName, { color: colors.primary }]}>
                          {winner.name}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.winnerStats}>
                      <Chip style={[styles.statChip, { backgroundColor: colors.primary }]} textStyle={styles.statChipText}>
                        {winner.points} puntos
                      </Chip>
                      <Chip style={[styles.statChip, { backgroundColor: colors.primary }]} textStyle={styles.statChipText}>
                        {winner.completed} completadas
                      </Chip>
                      <Chip style={[styles.statChip, { backgroundColor: colors.primary }]} textStyle={styles.statChipText}>
                        {winner.late} tardías
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  greetingSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  createCard: {
    margin: 20,
    marginTop: 20,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  createCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  createCardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  createCardSubtitle: {
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  homesList: {
    gap: 16,
  },
  homeCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  homeCardContent: {
    padding: 20,
  },
  homeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  homeInfo: {
    flex: 1,
  },
  homeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  homeSubtitle: {
    // Color will be set dynamically
  },
  homeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  secondaryActionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  chartCard: {
    borderRadius: 16,
    marginBottom: 20,
  },
  winnerCard: {
    borderRadius: 16,
    borderWidth: 2,
  },
  winnerContent: {
    padding: 20,
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  winnerAvatar: {
    marginRight: 16,
  },
  winnerInfo: {
    flex: 1,
  },
  winnerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  winnerName: {
    fontWeight: '600',
  },
  winnerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    // Background color will be set dynamically
  },
  statChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
