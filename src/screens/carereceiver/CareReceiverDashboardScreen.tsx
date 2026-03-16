import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CareReceiverTabParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';
import ApiService from '../../services/api';
import Icon from 'react-native-vector-icons/Feather';
import {
  WelcomeCard,
  StatCard,
} from '../../components/cards';
import SideMenu from '../../components/SideMenu';

type CareReceiverDashboardScreenProps = {
  navigation: NativeStackNavigationProp<CareReceiverTabParamList, 'Dashboard'>;
};

const CareReceiverDashboardScreen: React.FC<CareReceiverDashboardScreenProps> = ({
  navigation,
}) => {
  const {user} = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState({
    monthlyAppointments: 0,
    assignedCaregivers: 0,
    monthlyHours: 0,
    satisfactionRate: 0,
  });
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<any[]>([]);
  const [appointmentPage, setAppointmentPage] = useState(0);
  
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching dashboard data...');
      console.log('User:', user);
      
      // Use new dedicated dashboard endpoint
      const dashboardData = await ApiService.getCareReceiverDashboard();
      console.log('Dashboard Data received:', dashboardData);
      
      if (dashboardData) {
        // Set stats
        setDashboardStats(dashboardData.stats);
        console.log('Stats set:', dashboardData.stats);
        
        // Set weekly activity
        setWeeklyActivity(dashboardData.weeklyActivity || []);
        console.log('Weekly activity set:', dashboardData.weeklyActivity?.length);
        
        // Set service distribution
        setServiceDistribution(dashboardData.serviceDistribution || []);
        console.log('Service distribution set:', dashboardData.serviceDistribution?.length);
        
        // Format upcoming appointments
        const upcoming = dashboardData.upcomingAppointments.map((appointment: any) => ({
          id: appointment.id,
          caregiver: appointment.caregiver,
          service: appointment.service,
          date: new Date(appointment.date).toLocaleDateString(),
          time: appointment.startTime || 'TBD',
          duration: `${appointment.duration || 2} hours`,
          status: appointment.status,
          amount: appointment.totalAmount || 0,
        }));
        
        setUpcomingAppointments(upcoming);
        console.log('Upcoming appointments set:', upcoming.length);
      }
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again', [
          {text: 'OK', onPress: () => navigation.navigate('Profile')},
        ]);
      } else {
        Alert.alert('Error', `Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
      }
      
      // Set default empty data
      setDashboardStats({
        monthlyAppointments: 0,
        assignedCaregivers: 0,
        monthlyHours: 0,
        satisfactionRate: 0,
      });
      setUpcomingAppointments([]);
      setWeeklyActivity([]);
      setServiceDistribution([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };
  
  const paginatedAppointments = upcomingAppointments.slice(
    appointmentPage * ITEMS_PER_PAGE,
    (appointmentPage + 1) * ITEMS_PER_PAGE
  );
  
  const totalAppointmentPages = Math.ceil(upcomingAppointments.length / ITEMS_PER_PAGE);

  const userName = user?.name || 'Care Receiver';
  const firstName = userName.split(' ')[0];
  
  const getServiceColor = (index: number) => {
    const colors = ['#10b981', '#2563eb', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e'];
    return colors[index % colors.length];
  };

  const getMaxActivity = () => {
    if (weeklyActivity.length === 0) return 10;
    return Math.max(...weeklyActivity.map(d => Math.max(d.hours, d.appointments)));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.userName}>Dashboard</Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Icon name="menu" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
          <Text style={styles.loadingSubtext}>
            Please ensure you are logged in{'\n'}and the backend is running
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Side Menu */}
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{firstName}!</Text>
        </View>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
            colors={['#8b5cf6']}
          />
        }>
        {/* Welcome Card */}
        <View style={{paddingHorizontal: 16, paddingTop: 16}}>
          <WelcomeCard
            name={firstName}
            role="Care Receiver"
            themeColor="#8b5cf6"
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <StatCard
              label="Appointments"
              value={dashboardStats.monthlyAppointments.toString()}
              icon="calendar"
              trend="This month"
              color="#2563eb"
            />
            <StatCard
              label="Caregivers"
              value={dashboardStats.assignedCaregivers.toString()}
              icon="users"
              trend="Active"
              color="#10b981"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Care Hours"
              value={`${dashboardStats.monthlyHours}h`}
              icon="clock"
              trend="This month"
              color="#8b5cf6"
            />
            <StatCard
              label="Satisfaction"
              value={`${dashboardStats.satisfactionRate}%`}
              icon="heart"
              trend="Excellent"
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Weekly Care Activity Chart */}
        {weeklyActivity.length > 0 ? (
          <View style={styles.chartCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.chartTitle}>Weekly Care Activity</Text>
              <Text style={styles.subtitle}>Last 7 days overview</Text>
            </View>
            <View style={styles.chartContainer}>
              <View style={styles.chartYAxis}>
                <Text style={styles.yAxisLabel}>Count</Text>
              </View>
              <View style={styles.chartBars}>
                {weeklyActivity.map((data, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barGroup}>
                      <View style={styles.barWrapper}>
                        {data.hours > 0 && (
                          <Text style={styles.barValue}>{data.hours}</Text>
                        )}
                        <View
                          style={[
                            styles.bar,
                            styles.hoursBar,
                            {
                              height: `${(data.hours / getMaxActivity()) * 100}%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.barWrapper}>
                        {data.appointments > 0 && (
                          <Text style={styles.barValue}>{data.appointments}</Text>
                        )}
                        <View
                          style={[
                            styles.bar,
                            styles.appointmentsBar,
                            {
                              height: `${(data.appointments / getMaxActivity()) * 100}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.barLabel}>{data.day}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#3b82f6'}]} />
                <Text style={styles.legendText}>Hours</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#8b5cf6'}]} />
                <Text style={styles.legendText}>Appointments</Text>
              </View>
            </View>
            
            {/* Weekly Summary */}
            <View style={styles.weeklySummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {weeklyActivity.reduce((sum, d) => sum + d.hours, 0)}h
                </Text>
                <Text style={styles.summaryLabel}>Total Hours</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {weeklyActivity.reduce((sum, d) => sum + d.appointments, 0)}
                </Text>
                <Text style={styles.summaryLabel}>Total Appointments</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {(weeklyActivity.reduce((sum, d) => sum + d.hours, 0) / 7).toFixed(1)}h
                </Text>
                <Text style={styles.summaryLabel}>Daily Average</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.chartCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.chartTitle}>Weekly Care Activity</Text>
              <Text style={styles.subtitle}>Last 7 days overview</Text>
            </View>
            <View style={styles.emptyState}>
              <Icon name="activity" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No activity data yet</Text>
              <Text style={styles.emptySubtext}>
                Complete appointments to see weekly trends
              </Text>
            </View>
          </View>
        )}

        {/* Care Services Distribution */}
        {serviceDistribution.length > 0 ? (
          <View style={styles.chartCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.chartTitle}>Care Services Distribution</Text>
              <Text style={styles.subtitle}>
                {serviceDistribution.reduce((sum, s) => sum + s.value, 0)} total services • {serviceDistribution.length} types
              </Text>
            </View>
            
            {/* Service List */}
            <View style={styles.serviceList}>
              {serviceDistribution.map((service, index) => (
                <View key={index} style={styles.serviceItemContainer}>
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceLeft}>
                      <View
                        style={[
                          styles.serviceDot,
                          {backgroundColor: getServiceColor(index)},
                        ]}
                      />
                      <Text style={styles.serviceName}>{service.name}</Text>
                    </View>
                    <View style={styles.serviceRight}>
                      <Text style={styles.serviceValue}>{service.value} bookings</Text>
                      <View style={styles.percentageBadge}>
                        <Text style={styles.servicePercentage}>{service.percentage}%</Text>
                      </View>
                    </View>
                  </View>
                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${service.percentage}%`,
                          backgroundColor: getServiceColor(index),
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.chartCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.chartTitle}>Care Services Distribution</Text>
              <Text style={styles.subtitle}>Service types breakdown</Text>
            </View>
            <View style={styles.emptyState}>
              <Icon name="pie-chart" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No services data</Text>
              <Text style={styles.emptySubtext}>
                Book services to see distribution
              </Text>
            </View>
          </View>
        )}

        {/* Upcoming Appointments */}
        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.chartTitle}>Upcoming Appointments</Text>
            <Text style={styles.subtitle}>
              {upcomingAppointments.length} total bookings
            </Text>
          </View>
          {paginatedAppointments.length > 0 ? (
            paginatedAppointments.map(appointment => (
              <View key={appointment.id} style={styles.appointmentItem}>
                <View style={styles.appointmentIcon}>
                  <Icon name="user" size={20} color="#8b5cf6" />
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentCaregiver}>
                    {appointment.caregiver}
                  </Text>
                  <Text style={styles.appointmentDetails}>
                    {appointment.service} • {appointment.duration}
                  </Text>
                </View>
                <View style={styles.appointmentRight}>
                  <Text style={styles.appointmentTime}>
                    {appointment.date}
                  </Text>
                  <Text style={styles.appointmentTimeDetails}>
                    {appointment.time}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      appointment.status === 'confirmed'
                        ? styles.confirmedBadge
                        : styles.pendingBadge,
                    ]}>
                    <Icon
                      name={
                        appointment.status === 'confirmed'
                          ? 'check-circle'
                          : 'alert-circle'
                      }
                      size={12}
                      color={
                        appointment.status === 'confirmed' ? '#10b981' : '#f59e0b'
                      }
                    />
                    <Text
                      style={[
                        styles.statusText,
                        appointment.status === 'confirmed'
                          ? styles.confirmedText
                          : styles.pendingText,
                      ]}>
                      {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No upcoming appointments</Text>
              <Text style={styles.emptySubtext}>
                Book a caregiver to get started
              </Text>
            </View>
          )}
          
          {/* Pagination Controls */}
          {totalAppointmentPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  appointmentPage === 0 && styles.paginationButtonDisabled,
                ]}
                onPress={() => setAppointmentPage(appointmentPage - 1)}
                disabled={appointmentPage === 0}>
                <Icon
                  name="chevron-left"
                  size={18}
                  color={appointmentPage === 0 ? '#d1d5db' : '#8b5cf6'}
                />
              </TouchableOpacity>
              
              <View style={styles.pageIndicatorContainer}>
                {[...Array(totalAppointmentPages)].map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setAppointmentPage(index)}>
                    <View
                      style={[
                        styles.pageIndicator,
                        appointmentPage === index && styles.pageIndicatorActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  appointmentPage === totalAppointmentPages - 1 &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => setAppointmentPage(appointmentPage + 1)}
                disabled={appointmentPage === totalAppointmentPages - 1}>
                <Icon
                  name="chevron-right"
                  size={18}
                  color={
                    appointmentPage === totalAppointmentPages - 1
                      ? '#d1d5db'
                      : '#8b5cf6'
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Space for floating tab bar
  },
  statsSection: {
    padding: 20,
    paddingBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Replaced with StatCard
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    marginTop: 16,
  },
  chartYAxis: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#6b7280',
    transform: [{rotate: '-90deg'}],
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 25,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    flex: 1,
    width: '100%',
    paddingHorizontal: 2,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 20,
  },
  hoursBar: {
    backgroundColor: '#3b82f6',
  },
  appointmentsBar: {
    backgroundColor: '#8b5cf6',
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 6,
    position: 'absolute',
    bottom: 0,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  weeklySummary: {
    flexDirection: 'row',
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  serviceList: {
    gap: 16,
  },
  serviceItemContainer: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  percentageBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  serviceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  servicePercentage: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  appointmentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentCaregiver: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  appointmentDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  appointmentRight: {
    alignItems: 'flex-end',
  },
  appointmentTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  appointmentTimeDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confirmedBadge: {
    backgroundColor: '#f0fdf4',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  confirmedText: {
    color: '#10b981',
  },
  pendingText: {
    color: '#f59e0b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  paginationButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  pageIndicatorActive: {
    backgroundColor: '#8b5cf6',
    width: 24,
  },
});

export default CareReceiverDashboardScreen;
