import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Clipboard, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/axios';
import { AuthContext } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

export default function HomeDetailsScreen() {
  const { token } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();
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
          setHome(res.data.home);
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
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <IconButton
          icon="arrow-left"
          iconColor="#FFFFFF"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={styles.title}>🏠 Detalles del Hogar</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Información y miembros de tu hogar
        </Text>
      </LinearGradient>

      {home && (
        <Card style={[styles.homeCard, { backgroundColor: colors.backgroundSecondary }]} elevation={3}>
          <Card.Content style={styles.homeCardContent}>
            <View style={styles.homeHeader}>
              <Avatar.Icon
                size={60}
                icon="home"
                style={[styles.homeIcon, { backgroundColor: colors.primary }]}
              />
              <View style={styles.homeInfo}>
                <Text variant="headlineSmall" style={[styles.homeName, { color: colors.textPrimary }]}>
                  {home.name}
                </Text>
                <Text variant="bodyMedium" style={[styles.homeCode, { color: colors.textSecondary }]}>
                  Código: {home.code}
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={copyCode}
              icon="content-copy"
              style={[styles.copyButton, { backgroundColor: colors.primary }]}
              contentStyle={styles.buttonContent}
            >
              Copiar Código
            </Button>
          </Card.Content>
        </Card>
      )}

      <View style={styles.membersSection}>
        <Text style={[styles.membersTitle, { color: colors.textPrimary }]}>👥 Miembros del Hogar</Text>
        <Text style={[styles.membersSubtitle, { color: colors.textSecondary }]}>
          {members.length} miembro{members.length !== 1 ? 's' : ''} en total
        </Text>

        {members.map((member: any, index: number) => (
          <Card key={index} style={[styles.memberCard, { backgroundColor: colors.backgroundSecondary }]} elevation={2}>
            <Card.Content style={styles.memberCardContent}>
              <View style={styles.memberInfo}>
                <Avatar.Text
                  size={40}
                  label={member.name.charAt(0).toUpperCase()}
                  style={[styles.memberAvatar, { backgroundColor: colors.secondary }]}
                />
                <View style={styles.memberDetails}>
                  <Text variant="titleMedium" style={[styles.memberName, { color: colors.textPrimary }]}>
                    {member.name}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.memberEmail, { color: colors.textSecondary }]}>
                    {member.email}
                  </Text>
                </View>
              </View>
              <Chip
                style={[styles.memberStatus, { backgroundColor: colors.success }]}
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
  },
  header: {
    paddingTop: 8,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  homeCard: {
    margin: 20,
    marginTop: -20,
    borderRadius: 20,
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
    marginRight: 16,
  },
  homeInfo: {
    flex: 1,
  },
  homeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  homeCode: {
    fontFamily: 'monospace',
  },
  copyButton: {
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
    marginBottom: 8,
  },
  membersSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  memberCard: {
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
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
  },
  memberStatus: {},
  memberStatusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});
