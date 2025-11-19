import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Clipboard, Dimensions, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/axios';
import { AuthContext } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const { width } = Dimensions.get('window');

export default function HomeDetailsScreen() {
  const { token } = useContext(AuthContext);
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text variant="headlineMedium" style={styles.title}>🏠 Detalles del Hogar</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Información y miembros de tu hogar
        </Text>
      </LinearGradient>

      {home && (
        <Card style={styles.homeCard} elevation={3}>
          <Card.Content style={styles.homeCardContent}>
            <View style={styles.homeHeader}>
              <Avatar.Icon 
                size={60} 
                icon="home" 
                style={styles.homeIcon}
              />
              <View style={styles.homeInfo}>
                <Text variant="headlineSmall" style={styles.homeName}>
                  {home.name}
                </Text>
                <Text variant="bodyMedium" style={styles.homeCode}>
                  Código: {home.code}
                </Text>
              </View>
            </View>
            
            <Button 
              mode="contained" 
              onPress={copyCode} 
              icon="content-copy"
              style={styles.copyButton}
              contentStyle={styles.buttonContent}
            >
              Copiar Código
            </Button>
          </Card.Content>
        </Card>
      )}

      <View style={styles.membersSection}>
        <Text style={styles.membersTitle}>👥 Miembros del Hogar</Text>
        <Text style={styles.membersSubtitle}>
          {members.length} miembro{members.length !== 1 ? 's' : ''} en total
        </Text>
        
        {members.map((member: any, index: number) => (
          <Card key={index} style={styles.memberCard} elevation={2}>
            <Card.Content style={styles.memberCardContent}>
              <View style={styles.memberInfo}>
                <Avatar.Text 
                  size={40} 
                  label={member.name.charAt(0).toUpperCase()} 
                  style={styles.memberAvatar}
                />
                <View style={styles.memberDetails}>
                  <Text variant="titleMedium" style={styles.memberName}>
                    {member.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.memberEmail}>
                    {member.email}
                  </Text>
                </View>
              </View>
              <Chip 
                style={styles.memberStatus}
                textStyle={styles.memberStatusText}
              >
                Activo
              </Chip>
            </Card.Content>
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.buttonText,
    opacity: 0.9,
    textAlign: 'center',
  },
  homeCard: {
    margin: 20,
    marginTop: -20,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  homeCardContent: {
    padding: 24,
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  homeIcon: {
    backgroundColor: Colors.primary,
    marginRight: 16,
  },
  homeInfo: {
    flex: 1,
  },
  homeName: {
    color: Colors.textDark,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  homeCode: {
    color: Colors.textLight,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  membersSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  membersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  membersSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
  },
  memberCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    marginBottom: 12,
  },
  memberCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    backgroundColor: Colors.secondary,
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    color: Colors.textDark,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberEmail: {
    color: Colors.textLight,
    fontSize: 12,
  },
  memberStatus: {
    backgroundColor: Colors.success,
  },
  memberStatusText: {
    color: Colors.buttonText,
    fontWeight: '600',
    fontSize: 12,
  },
});
