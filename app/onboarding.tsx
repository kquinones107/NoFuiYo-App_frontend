import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Colors from '../src/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onboardingData = [  
    {
      image: require('../assets/mock1.png'),
      title: 'Organiza tus tareas',
      subtitle: 'Mantén un control total de tus actividades diarias con nuestra interfaz intuitiva',
      buttonLabel: 'Continuar',
    },
    {
      image: require('../assets/mock2.png'),
      title: 'Colabora en equipo',
      subtitle: 'Asigna tareas y trabaja junto con tu equipo de manera eficiente',
      buttonLabel: 'Continuar',
    },
    {
      image: require('../assets/mock3.png'),
      title: '¡Comienza ahora!',
      subtitle: 'Únete a miles de usuarios que ya están organizando su vida con NoFuiYo',
      buttonLabel: 'Comenzar',
    },
  ];

  const handleIndicatorPress = (index: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrentIndex(index);
  };

  // Manejador para cambiar a la siguiente pantalla
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/login'); // Navega a la siguiente pantalla después del último slide
    }
  };

  const { image, title, subtitle, buttonLabel } = onboardingData[currentIndex];

  return (
    <View style={styles.container}>
      <ImageBackground source={image} style={styles.background} resizeMode="cover">
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
          style={styles.overlay}
        />
        
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {/* Header with logo */}
          <View style={styles.header}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>NoFuiYo</Text>
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {/* Progress indicators */}
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

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
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

            {currentIndex < onboardingData.length - 1 && (
              <TouchableOpacity 
                style={styles.skipButton} 
                onPress={() => router.push('/login')}
              >
                <Text style={styles.skipText}>Omitir</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.buttonText,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: Colors.buttonText,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: { 
    fontSize: 18, 
    textAlign: 'center', 
    color: Colors.buttonText,
    lineHeight: 24,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  indicatorContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    marginBottom: 40,
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
  buttonContainer: {
    alignItems: 'center',
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
  skipButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: Colors.buttonText,
    fontSize: 16,
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
});