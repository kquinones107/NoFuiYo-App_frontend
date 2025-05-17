import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Colors from '../src/constants/Colors';

export default function Onboarding() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Swiper loop={false} showsPagination activeDotColor={Colors.button}>
        <View style={styles.slide}>
          <Image source={require('../assets/mock1.png')} style={styles.image} />
          <Text style={styles.text}>Organiza los turnos de aseo fácilmente</Text>
        </View>
        <View style={styles.slide}>
          <Image source={require('../assets/mock1.png')} style={styles.image} />
          <Text style={styles.text}>Sube evidencia de las tareas realizadas</Text>
        </View>
        <View style={styles.slide}>
          <Image source={require('../assets/mock1.png')} style={styles.image} />
          <Text style={styles.text}>Todo el hogar conectado y en orden</Text>
        </View>
      </Swiper>

      <Button
        mode="contained"
        onPress={() => router.replace('/login')}
        style={styles.button}
      >
        Empezar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    flex: 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    color: Colors.textDark,
  },
  button: {
    margin: 20,
    backgroundColor: Colors.button,
  },
});
