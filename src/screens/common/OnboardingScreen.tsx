import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
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
    const isFirstSlide = slide.id === 1;

    return (
      <View style={styles.slide} key={slide.id}>
        <SafeAreaView style={styles.safeArea}>
          {/* Icon Container */}
          <View style={styles.iconWrapper}>
            <View style={[
              styles.iconContainer,
              isFirstSlide ? styles.firstSlideIconContainer : {backgroundColor: slide.backgroundColor}
            ]}>
              {isFirstSlide ? (
                <Image
                  source={require('../../public/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <Icon name={slide.icon} size={80} color={slide.color} />
              )}
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
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
  },
  getStartedButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  slideBackgroundFirst: {
    backgroundColor: '#ffffff',
  },
  slideBackgroundDynamic: {
    // Dynamic background will be set inline
  },
});

export default OnboardingScreen;
