import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Swiper from 'react-native-swiper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DEVELOPMENT HELPER: To reset onboarding and see it again, run this in your app:
// import AsyncStorage from '@react-native-async-storage/async-storage';
// AsyncStorage.removeItem('hasSeenOnboarding');

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
};

interface Slide {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Welcome to ElderEase',
    description: 'Your trusted platform connecting compassionate caregivers with those who need quality care',
    icon: 'heart',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  {
    id: 2,
    title: 'For Caregivers',
    description: 'Find meaningful work, manage your schedule, and build lasting relationships with clients',
    icon: 'users',
    color: '#9333EA',
    backgroundColor: '#F3E8FF',
  },
  {
    id: 3,
    title: 'For Care Receivers',
    description: 'Access verified caregivers, schedule services, and receive the care you deserve with ease',
    icon: 'shield',
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  {
    id: 4,
    title: 'Get Started',
    description: 'Join thousands of caregivers and families building better care experiences together',
    icon: 'check-circle',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({navigation}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<Swiper>(null);

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Welcome');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Welcome');
  };

  const renderSlide = (slide: Slide) => {
    const isLastSlide = slide.id === slides.length;

    return (
      <View style={styles.slide} key={slide.id}>
        <SafeAreaView style={styles.safeArea}>
          {/* Icon Container */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconContainer, {backgroundColor: slide.backgroundColor}]}>
              <Icon name={slide.icon} size={80} color={slide.color} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomContainer}>
            {isLastSlide ? (
              <>
                <TouchableOpacity
                  style={[styles.getStartedButton, {backgroundColor: slide.color}]}
                  onPress={handleGetStarted}
                  activeOpacity={0.8}>
                  <Text style={styles.getStartedButtonText}>Get Started</Text>
                  <Icon name="arrow-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}>
                  <Text style={styles.signInButtonText}>Already have an account? Sign In</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.nextButton, {backgroundColor: slide.color}]}
                onPress={handleNext}
                activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Swiper */}
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination={true}
        onIndexChanged={index => setCurrentIndex(index)}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        paginationStyle={styles.pagination}>
        {slides.map(slide => renderSlide(slide))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  slide: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  bottomContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 56,
    borderRadius: 30,
    gap: 10,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  getStartedButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signInButton: {
    paddingVertical: 12,
  },
  signInButtonText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  pagination: {
    bottom: 140,
  },
  dot: {
    backgroundColor: '#D1D5DB',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#111827',
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default OnboardingScreen;
