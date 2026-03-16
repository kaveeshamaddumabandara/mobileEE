import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({icon, value, label, color, trend}) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, {backgroundColor: `${color}15`}]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Icon
                name={trend.isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={trend.isPositive ? '#10B981' : '#EF4444'}
              />
              <Text
                style={[
                  styles.trendText,
                  {color: trend.isPositive ? '#10B981' : '#EF4444'},
                ]}>
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatCard;
