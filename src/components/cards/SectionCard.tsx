import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  children: React.ReactNode;
  style?: ViewStyle;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  action,
  children,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={action.onPress}
            activeOpacity={0.7}>
            <Text style={styles.actionText}>{action.label}</Text>
            <Icon name="chevron-right" size={16} color="#7C3AED" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  content: {
    // Container for children
  },
});

export default SectionCard;
