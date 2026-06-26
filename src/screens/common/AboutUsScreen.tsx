import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface AboutUsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const AboutUsScreen: React.FC<AboutUsScreenProps> = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>CareConnect</Text>
          <Text style={styles.heroSubtitle}>
            Connecting families with trusted caregivers for safer, kinder home care.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            We make quality caregiving accessible by helping care receivers find qualified,
            compassionate caregivers with confidence.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#10b981" />
            <Text style={styles.bulletText}>Verified caregiver profiles and skills</Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#10b981" />
            <Text style={styles.bulletText}>Easy booking and communication tools</Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#10b981" />
            <Text style={styles.bulletText}>Care documentation and progress tracking</Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#10b981" />
            <Text style={styles.bulletText}>Support for both caregivers and families</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <Text style={styles.sectionText}>Trust. Respect. Safety. Compassion.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  heroCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default AboutUsScreen;
