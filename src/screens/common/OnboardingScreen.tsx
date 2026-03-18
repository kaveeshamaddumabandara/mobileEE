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
    const isCaregiverSlide = slide.id === 2;
    const isCareReceiverSlide = slide.id === 3;
    const isGetStartedSlide = slide.id === 4;

    return (
      <View style={styles.slide} key={slide.id}>
        <SafeAreaView style={styles.safeArea}>
          {/* Image/Icon Container */}
          <View style={styles.iconWrapper}>
            {isFirstSlide ? (
              <View style={styles.firstSlideIconContainer}>
                <Image
                  source={require('../../public/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            ) : isCaregiverSlide ? (
              <Image
                source={require('../../public/caregiver_banner.jpg')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : isCareReceiverSlide ? (
              <Image
                source={require('../../public/Carereceiver_banner.jpg')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : isGetStartedSlide ? (
              <Image
                source={require('../../public/aubowan_banner.jpg')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.iconContainer, {backgroundColor: slide.backgroundColor}]}>
                <Icon name={slide.icon} size={80} color={slide.color} />
              </View>
            )}
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
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstSlideIconContainer: {
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: 160,
    height: 160,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
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
    paddingHorizontal: 10,
  },
  bottomContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  getStartedButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 12,
    gap: 8,
  },
  getStartedButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  signInButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  pagination: {
    bottom: 120,
  },
  dot: {
    backgroundColor: '#D1D5DB',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default OnboardingScreen;
