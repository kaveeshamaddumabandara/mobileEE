import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import ApiService from '../../services/api';
import {CareReceiver, Caregiver} from '../../types';

const CareReceiverDashboardScreen: React.FC = () => {
  const {user} = useAuth();
  const [profile, setProfile] = useState<CareReceiver | null>(null);
  const [availableCaregivers, setAvailableCaregivers] = useState<Caregiver[]>(
    [],
  );
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profileData, caregiversData, statsData] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getCaregivers(),
        ApiService.getDashboardStats(),
      ]);
      setProfile(profileData as CareReceiver);
      setAvailableCaregivers(
        caregiversData.filter(cg => cg.availability).slice(0, 5),
      );
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCaregiverCard = ({item}: {item: Caregiver}) => (
    <TouchableOpacity style={styles.caregiverCard}>
      <View style={styles.caregiverHeader}>
        <View style={styles.caregiverAvatar}>
          <Text style={styles.caregiverInitial}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.caregiverInfo}>
          <Text style={styles.caregiverName}>{item.name}</Text>
          <Text style={styles.caregiverExperience}>
            {item.experience} years exp.
          </Text>
        </View>
        <View style={styles.caregiverRating}>
          <Text style={styles.ratingText}>⭐ {item.rating?.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.caregiverSkills}>
        {item.skills?.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
      <View style={styles.caregiverFooter}>
        <Text style={styles.hourlyRate}>${item.hourlyRate}/hr</Text>
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Request</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboardData} />
        }>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{user?.name || 'Care Receiver'}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.activeRequests || 0}</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
            <Text style={styles.statIcon}>📋</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalCaregivers || 0}</Text>
            <Text style={styles.statLabel}>Available Caregivers</Text>
            <Text style={styles.statIcon}>👥</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.upcomingAppointments || 0}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
            <Text style={styles.statIcon}>📅</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>${stats?.totalSpent || 0}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statIcon}>💰</Text>
          </View>
        </View>

        {/* Profile Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Care Profile</Text>
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{profile?.age || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Medical Conditions:</Text>
              <Text style={styles.infoValue}>
                {profile?.medicalConditions?.join(', ') || 'None specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Emergency Contact:</Text>
              <Text style={styles.infoValue}>
                {profile?.emergencyContact?.name || 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Available Caregivers */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Available Caregivers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          {availableCaregivers.length > 0 ? (
            availableCaregivers.map(caregiver => (
              <View key={caregiver._id}>
                {renderCaregiverCard({item: caregiver})}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No caregivers available at the moment
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Find Caregiver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💳</Text>
              <Text style={styles.actionText}>Payments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  statIcon: {
    fontSize: 24,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  profileInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
    textAlign: 'right',
  },
  caregiverCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  caregiverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  caregiverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caregiverInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  caregiverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  caregiverExperience: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  caregiverRating: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  caregiverSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#2563eb',
  },
  caregiverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  requestButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    paddingVertical: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
});

export default CareReceiverDashboardScreen;
