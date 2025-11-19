import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checking, setChecking] = useState(true);
  const { token } = useContext(AuthContext);
  const { colors } = useTheme();

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

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await AsyncStorage.getItem('hasOnboarded');

      if (!onboarded) {
        router.replace('/onboarding');
      } else if (token) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }

      setChecking(false);
    };

    checkOnboarding();
  }, [token, router]);

  const handleIndicatorPress = (index: number) => {
    setCurrentIndex(index);
  };

  // Manejador para cambiar a la siguiente pantalla
  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.replace('/login'); // Navega a la siguiente pantalla después del último slide
    }
  };

  const { image, buttonLabel } = onboardingData[currentIndex];

  if (checking) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
          style={styles.loadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ActivityIndicator size="large" color={colors.buttonText} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <ImageBackground source={image} style={[styles.background, { backgroundColor: colors.background }]} resizeMode="cover">
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
        style={styles.overlay}
      />
      
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
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  indicatorContainer: { 
    flexDirection: 'row', 
    marginBottom: 40,
    justifyContent: 'center',
  },
  indicator: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: 'rgba(255,255,255,0.4)', 
    marginHorizontal: 6,
  },
  activeIndicator: { 
    backgroundColor: Colors.buttonText,
    width: 32,
    height: 12,
    borderRadius: 6,
  },
  button: {
    width: width * 0.8,
    height: 56,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  buttonText: { 
    color: Colors.buttonText, 
    fontSize: 18,
    fontWeight: 'bold',
  },
});
