import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface UpcomingItemProps {
  title: string;
  subtitle: string;
  time: string;
  status?: 'confirmed' | 'pending' | string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const UpcomingCard: React.FC<UpcomingItemProps> = ({
  title,
  subtitle,
  time,
  status,
  icon = 'calendar',
  iconColor = '#7C3AED',
  onPress,
  style,
}) => {
  const getStatusColor = () => {
    if (status === 'confirmed') return '#10B981';
    if (status === 'pending') return '#F59E0B';
    return '#6B7280';
  };

  const getStatusIcon = () => {
    if (status === 'confirmed') return 'check-circle';
    if (status === 'pending') return 'alert-circle';
    return 'clock';
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}>
      <View style={[styles.iconContainer, {backgroundColor: `${iconColor}15`}]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        <View style={styles.timeContainer}>
          <Icon name="clock" size={12} color="#9CA3AF" />
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
      {status && (
        <View style={styles.statusContainer}>
          <Icon name={getStatusIcon()} size={16} color={getStatusColor()} />
          <Text style={[styles.statusText, {color: getStatusColor()}]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      )}
      {!status && onPress && (
        <Icon name="chevron-right" size={20} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default UpcomingCard;
