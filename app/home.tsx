import { LinearGradient } from 'expo-linear-gradient';
import { useRouter} from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ActivityIndicator, Avatar, Button, Card, Chip, IconButton, Menu, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/axios';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { RecurringTasksWidget, type WidgetTask } from '../src/components/RecurringTasksWidget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CopilotStep, walkthroughable, useCopilot } from 'react-native-copilot';

//const screenWidth = Dimensions.get('window').width;
const WalkthroughableView = walkthroughable(View);

type Home = {
  _id: string;
  name: string;
  createdAt: string;
  // agrega aquí otras propiedades si las hay
};

export default function HomeScreen() {
  const router = useRouter();
  const {  isSignedIn, isLoaded , signOut } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 720 : undefined;
  const chartWidth = isTablet ? 640 : width - 60;

  type Stat = { name: string; points: number; completed: number; late: number };
  const [stats, setStats] = useState<Stat[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [tasks, setTasks] = useState<WidgetTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const { user } = useUser();
  const { start } = useCopilot();
  const [tourChecked, setTourChecked] = useState(false);

  const handleCreateHome = () => {
    router.push('/home-setup');
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };


  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchData = async () => {
      try {
        const [homesResult, statsResult] = await Promise.allSettled([
          API.get('/home/mis-hogares'),
          API.get('/stats/monthly'),
        ]);

        if (homesResult.status === 'fulfilled') {
          setHomes(homesResult.value.data.homes ?? []);
        }

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value.data.stats ?? []);
        }
      } catch (err) {
        console.error('Error al cargar datos del home:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn]);

  const refreshTasks = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    try {
      const res = await API.get('/tasks');
      setTasks(res.data.tasks ?? []);
    } catch (e) {
      console.error('Error al actualizar tareas:', e);
    }
  }, [isLoaded, isSignedIn]);

  useFocusEffect(
    useCallback(() => {
      refreshTasks();
    }, [refreshTasks])
  );

  useEffect(() => {
    const checkHomeTour = async () => {
      if (!isLoaded || !isSignedIn || loading ||tourChecked) return;

      // 👇 TEMPORAL: borrar marca del tutorial para volver a probarlo
      // await AsyncStorage.removeItem('hasSeenHomeTour');

      const hasSeenTour = await AsyncStorage.getItem('hasSeenHomeTour');

      if (!hasSeenTour) {
        setTimeout(() => {
          start();
        }, 800); // Espera a que la pantalla se haya renderizado completamente
        await AsyncStorage.setItem('hasSeenHomeTour', 'true');
      }

      setTourChecked(true);
    };
    checkHomeTour();
  }, [isLoaded, isSignedIn, loading, start, tourChecked]);


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
        
        <View style={[styles.homeActions, !isTablet && styles.mobileHomeActions]}>
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
        <View
          style={[
            styles.headerContent,
            isTablet && styles.tabletCenteredContent,
          ]}
        >
          <View style={styles.greetingContainer}>
            <Text variant="headlineMedium" style={styles.greeting}>
              ¡Hola {user?.firstName || user?.username || 'Usuario'}! 👋
            </Text>
            <Text variant="bodyMedium" style={styles.greetingSubtitle}>
              Bienvenido de vuelta a NoFuiYo
            </Text>
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <CopilotStep
                text="Desde aquí puedes abrir el menú para usar la ruleta, editar tu perfil, ver fechas especiales y cerrar sesión."
                order={1}
                name="menu-principal"
              >
                <WalkthroughableView>
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    onPress={openMenu}
                    iconColor={colors.buttonText}
                  />
                </WalkthroughableView>
              </CopilotStep>
            }
          >
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/gossip');}} title="🔥 Chismecito NoFuiYo"/>
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/neighbors'); }} title="🏘️ Hogares vecinos" />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/rulette'); }} title="🎡 Ruleta" />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/specialDate');}} title="🎉 Fechas especiales" />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/editProfile'); }} title="✏️ Editar perfil" />
            <Menu.Item onPress={() => {closeMenu(); toggleTheme(); }} title={isDark ? "☀️ Modo claro" : "🌙 Modo oscuro"} />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/aboutApp'); }} title="📄 Acerca de la app" />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/privacyPolicy');}} title="🔒 Políticas de privacidad" />
            <Menu.Item onPress={() => {closeMenu(); router.push('/menu/specialDate');}} title="🎉 Fechas especiales" />
            <Menu.Item
             onPress={() => {
             closeMenu();
             handleLogout(); // Cierra la sesión
            }}
            title="🚪 Cerrar sesión"
            />
          </Menu>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.tabletScrollContent,
        ]}
      >
        <CopilotStep
          text="Aquí verás tus tareas recurrentes y el progreso hacia su próxima fecha límite."
          order={2}
          name="tareas-recurrentes"
        >
          <WalkthroughableView
            style={[
              styles.widgetSection,
              isTablet && styles.tabletSection,
            ]}
          >
            <Text style={[styles.widgetTitle, { color: colors.textPrimary }]}>Tareas recurrentes</Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textSecondary }]}>
              Progreso circular hasta la próxima fecha límite. Toca una tarjeta para completarla.
            </Text>
            <RecurringTasksWidget tasks={tasks} colors={colors} />
          </WalkthroughableView>
        </CopilotStep>

        {homes.length === 0 && (
          <CopilotStep
            text="Aquí puedes crear un nuevo hogar para invitar miembros y empezar a organizar tareas, o unirte a un hogar existente con un código de invitación."
            order={3}
            name="crear-hogar"
          >
            <WalkthroughableView>
              <Card
                style={[
                  styles.createCard,
                  isTablet && styles.tabletSection,
                  { backgroundColor: colors.cardBackground, borderColor: colors.primary },
                ]}
                onPress={handleCreateHome}
                elevation={2}
              >
                <Card.Content style={styles.createCardContent}>
                  <Text variant="headlineSmall" style={[styles.createCardTitle, { color: colors.primary }]}>
                    ➕ Crear nuevo hogar
                  </Text>
                  <Text variant="bodyMedium" style={[styles.createCardSubtitle, { color: colors.textSecondary }]}>
                    Establece un nuevo hogar para tu familia
                  </Text>
                </Card.Content>
              </Card>
            </WalkthroughableView>
          </CopilotStep>
        )}

        <View style={[styles.section, isTablet && styles.tabletSection]}>
          <CopilotStep
            text="Aquí aparecen tus hogares activos. Desde cada hogar puedes ver tareas, historial y detalles."
            order={4}
            name="hogares-activos"
          >
            <WalkthroughableView>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tus hogares activos</Text>
            </WalkthroughableView>
          </CopilotStep>

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
        <View style={[styles.statsSection, isTablet && styles.tabletSection]}>
          <CopilotStep
            text="Aquí verás el rendimiento mensual, tareas completadas, tareas tardías y el integrante destacado."
            order={5}
            name="estadisticas-mes"
          >
            <WalkthroughableView>
              <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>📊 Estadísticas del Mes</Text>
            </WalkthroughableView>
          </CopilotStep>

          <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
            Rendimiento y logros de tu equipo
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando estadísticas...</Text>
            </View>
          ) : stats.length === 0 ? (
            <Card style={[styles.chartCard, styles.emptyStateCard, { backgroundColor: colors.cardBackground }]} elevation={2}>
              <Card.Content style={styles.emptyStateContent}>
                <Text style={[styles.emptyStateIcon, { color: colors.textTertiary }]}>📊</Text>
                <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
                  Sin datos aún
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                  Crea tareas en tus hogares y complétalas para ver las estadísticas del mes y el rendimiento de tu equipo aquí.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => homes.length > 0 && router.push(`/tasks?homeId=${homes[0]._id}`)}
                  style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                  contentStyle={styles.emptyStateButtonContent}
                  disabled={homes.length === 0}
                >
                  {homes.length > 0 ? 'Ir a tareas' : 'Crea un hogar primero'}
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <>
              <Card style={[styles.chartCard, { backgroundColor: colors.cardBackground }]} elevation={2}>
                <Card.Content>
                  <BarChart
                    data={chartData}
                    width={chartWidth}
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
  widgetSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  widgetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  widgetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
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
  mobileHomeActions: {
    flexDirection: 'row',
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
  emptyStateCard: {
    minHeight: 200,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  emptyStateButton: {
    borderRadius: 12,
  },
  emptyStateButtonContent: {
    paddingVertical: 6,
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
  tabletCenteredContent: {
  width: '100%',
  maxWidth: 720,
  alignSelf: 'center',
},

tabletScrollContent: {
  alignItems: 'center',
},

tabletSection: {
  width: '100%',
  maxWidth: 720,
  alignSelf: 'center',
},
});
