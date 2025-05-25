import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ImageBackground 
} from 'react-native';
import Colors from '../src/constants/Colors';

export default function OnboardingScreen() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const onboardingData = [  
    {
      image: require('../assets/mock1.png'),
      
      buttonLabel: 'Continue',
    },
    {
      image: require('../assets/mock2.png'),
      buttonLabel: 'Continue',
    },
    {
      image: require('../assets/mock3.png'),
      buttonLabel: 'Get Started',
    },
  ];

  const handleIndicatorPress = (index: number) => {
    setCurrentIndex(index);
  };

  // Manejador para cambiar a la siguiente pantalla
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/login'); // Navega a la siguiente pantalla después del último slide
    }
  };

  const { image, buttonLabel } = onboardingData[currentIndex];

  return (
    <ImageBackground  source={image} style={styles.background} resizeMode="contain">
      <View style={styles.contentContainer}>


        {/* Indicadores */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleIndicatorPress(index)}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Posiciona el contenido al final del fondo
    alignItems: 'center',
    paddingBottom: 60, // Ajusta la distancia del contenido al borde inferior
    paddingHorizontal: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#777', 
    marginBottom: 30 },
  button: { 
    backgroundColor: Colors.grayDark, 
    padding: 15, 
    paddingHorizontal: 80,
    borderRadius: 22 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: 'bold' 
  },
  indicatorContainer: { 
    flexDirection: 'row', 
    marginBottom: 20 
  },
  indicator: { 
    width: 20, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#ccc', 
    marginHorizontal: 5 
  },
  activeIndicator: { 
    backgroundColor: Colors.grayDark, 
    width: 50,
    height: 10,

  },
});
