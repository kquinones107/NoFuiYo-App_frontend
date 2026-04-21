import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Clipboard, Platform, StyleSheet, TextInput, View } from 'react-native';
import { Avatar, Button, Card, Chip, IconButton, Modal, Portal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/axios';
import { useTheme } from '../src/context/ThemeContext';

export default function HomeDetailsScreen() {
  const { getToken } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [home, setHome] = useState<any>(null);
  const [members, setMembers] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchHome = async () => {
    try {
      const t = await getToken();
      const res = await API.get('/home/members', {
        headers: { Authorization: `Bearer ${t}` },
      });
      setMembers(res.data.members);
      setHome(res.data.home);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar la información del hogar');
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  const copyCode = () => {
    Clipboard.setString(home?.code || '');
    Alert.alert('Código copiado', 'El código del hogar ha sido copiado al portapapeles');
  };

  const openEditModal = () => {
    setNewHomeName(home?.name || '');
    setEditModalVisible(true);
  };

  const handleUpdateHome = async () => {
    if (!newHomeName.trim()) {
      Alert.alert('Campo requerido', 'El nombre del hogar no puede estar vacío');
      return;
    }
    try {
      setSaving(true);
      const t = await getToken();
      await API.put(`/home/${home._id}`, { name: newHomeName.trim() }, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setEditModalVisible(false);
      await fetchHome();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el hogar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHome = () => {
    Alert.alert(
      'Eliminar hogar',
      '¿Estás seguro? Esta acción eliminará el hogar y desvinculará a todos los miembros.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const t = await getToken();
              await API.delete(`/home/${home._id}`, {
                headers: { Authorization: `Bearer ${t}` },
              });
              router.replace('/home');
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el hogar');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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

            <View style={styles.actionRow}>
              <Button
                mode="outlined"
                onPress={openEditModal}
                icon="pencil"
                style={styles.actionButton}
                contentStyle={styles.buttonContent}
              >
                Editar nombre
              </Button>
              <Button
                mode="outlined"
                onPress={handleDeleteHome}
                icon="delete"
                loading={deleting}
                disabled={deleting}
                style={[styles.actionButton, styles.deleteButton]}
                textColor={colors.error ?? '#EF4444'}
                contentStyle={styles.buttonContent}
              >
                Eliminar
              </Button>
            </View>
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

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: colors.backgroundSecondary }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Editar nombre del hogar
          </Text>
          <TextInput
            value={newHomeName}
            onChangeText={setNewHomeName}
            placeholder="Nuevo nombre"
            placeholderTextColor={colors.textSecondary}
            style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.inputBorder ?? colors.primary }]}
          />
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateHome}
              loading={saving}
              disabled={saving}
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
            >
              Guardar
            </Button>
          </View>
        </Modal>
      </Portal>
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
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  deleteButton: {
    borderColor: '#EF4444',
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
  modal: {
    margin: 24,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    borderRadius: 10,
  },
});
