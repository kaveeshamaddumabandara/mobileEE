import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface WelcomeCardProps {
  name: string;
  role: string;
  themeColor?: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  name,
  role,
  themeColor = '#7C3AED',
}) => {
  return (
    <View style={[styles.card, {backgroundColor: themeColor}]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{name}!</Text>
          <Text style={styles.message}>You are logged in as {role}. Check your schedule for today.</Text>
        </View>
      </View>
      <View style={styles.decoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    minHeight: 140,
  },
  content: {
    zIndex: 1,
  },
  textContainer: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  decoration: {
    position: 'absolute',
    right: -20,
    top: -20,
    opacity: 0.15,
  },
  circle1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  circle2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 60,
    top: 60,
  },
});

export default WelcomeCard;
