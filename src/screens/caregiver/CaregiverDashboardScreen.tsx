import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CaregiverTabParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import SideMenu from '../../components/SideMenu';
import api from '../../services/api';

type CaregiverDashboardScreenProps = {
  navigation: NativeStackNavigationProp<CaregiverTabParamList, 'Dashboard'>;
};

const CaregiverDashboardScreen: React.FC<CaregiverDashboardScreenProps> = ({
  navigation,
}) => {
  const {user, logout} = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState({
    earnings: 0,
    clients: 0,
    hours: 0,
    rating: 0,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [clientSatisfaction, setClientSatisfaction] = useState<any[]>([]);
  const [allFeedback, setAllFeedback] = useState<any[]>([]);
  const [allSchedule, setAllSchedule] = useState<any[]>([]);
  
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [schedulePage, setSchedulePage] = useState(0);
  
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await api.getCaregiverDashboardStats();
      console.log('Stats response:', statsResponse);
      setDashboardStats(statsResponse || { earnings: 0, clients: 0, hours: 0, rating: 0 });
      
      // Fetch performance metrics
      const performanceResponse = await api.getCaregiverPerformance();
      console.log('Performance response:', performanceResponse);
      const metrics = performanceResponse?.metrics || [];
      setPerformanceMetrics(Array.isArray(metrics) ? metrics : []);
      
      // Fetch client satisfaction
      const satisfactionResponse = await api.getCaregiverClientSatisfaction();
      console.log('Satisfaction response:', satisfactionResponse);
      const satisfactionData = satisfactionResponse?.satisfaction || [];
      setClientSatisfaction(Array.isArray(satisfactionData) ? satisfactionData : []);
      
      // Fetch feedback
      const feedbackData = await api.getCaregiverFeedback();
      setAllFeedback(Array.isArray(feedbackData) ? feedbackData : []);
      
      // Fetch upcoming bookings as schedule
      const bookings = await api.getCaregiverBookings();
      if (Array.isArray(bookings)) {
        const upcomingBookings = bookings
          .filter((booking: any) => 
            booking.status === 'confirmed' || booking.status === 'pending'
          )
          .map((booking: any) => ({
            id: booking._id,
            client: booking.careReceiverId?.name || 'Unknown',
            service: booking.serviceType,
            time: new Date(booking.date).toLocaleDateString() + ', ' + booking.startTime,
            duration: `${booking.duration || 2} hours`,
            status: booking.status,
          }))
          .slice(0, 10);
        setAllSchedule(upcomingBookings);
      } else {
        setAllSchedule([]);
      }
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
      // Set empty arrays to prevent undefined errors
      setAllFeedback([]);
      setAllSchedule([]);
      setPerformanceMetrics([]);
      setClientSatisfaction([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };
  
  const recentFeedback = allFeedback.slice(
    feedbackPage * ITEMS_PER_PAGE,
    (feedbackPage + 1) * ITEMS_PER_PAGE
  );
  
  const totalFeedbackPages = Math.ceil(allFeedback.length / ITEMS_PER_PAGE);

  const upcomingSchedule = allSchedule.slice(
    schedulePage * ITEMS_PER_PAGE,
    (schedulePage + 1) * ITEMS_PER_PAGE
  );
  
  const totalSchedulePages = Math.ceil(allSchedule.length / ITEMS_PER_PAGE);

  const userName = user?.name || 'Caregiver';
  const firstName = userName.split(' ')[0];

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
            colors={['#8b5cf6']}
          />
        }>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            {/* Earnings Card */}
            <View style={[styles.statCard, styles.earningsCard]}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, styles.earningsIcon]}>
                  <Icon name="dollar-sign" size={22} color="#10b981" />
                </View>
              </View>
              <Text style={styles.statValue}>LKR {dashboardStats.earnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>

            {/* Clients Card */}
            <View style={[styles.statCard, styles.clientsCard]}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, styles.clientsIcon]}>
                  <Icon name="users" size={22} color="#2563eb" />
                </View>
              </View>
              <Text style={styles.statValue}>{dashboardStats.clients}</Text>
              <Text style={styles.statLabel}>Active Clients</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Hours Card */}
            <View style={[styles.statCard, styles.hoursCard]}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, styles.hoursIcon]}>
                  <Icon name="clock" size={22} color="#8b5cf6" />
                </View>
              </View>
              <Text style={styles.statValue}>{dashboardStats.hours}</Text>
              <Text style={styles.statLabel}>Hours This Week</Text>
            </View>

            {/* Rating Card */}
            <View style={[styles.statCard, styles.ratingCard]}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, styles.ratingIcon]}>
                  <Icon name="star" size={22} color="#f59e0b" />
                </View>
              </View>
              <Text style={styles.statValue}>{dashboardStats.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
          </View>
        </View>

        {/* Client Satisfaction Chart */}
        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.chartTitle}>Client Satisfaction</Text>
            <Text style={styles.subtitle}>Based on 80 reviews</Text>
          </View>
          <View style={styles.satisfactionContainer}>
            {clientSatisfaction.map((item, index) => (
              <View key={index} style={styles.satisfactionRow}>
                <View style={styles.satisfactionLabel}>
                  <View
                    style={[
                      styles.satisfactionDot,
                      {backgroundColor: item.color},
                    ]}
                  />
                  <Text style={styles.satisfactionText}>{item.category}</Text>
                </View>
                <View style={styles.satisfactionBarContainer}>
                  <View
                    style={[
                      styles.satisfactionBar,
                      {width: `${item.percentage}%`, backgroundColor: item.color},
                    ]}
                  />
                </View>
                <Text style={styles.satisfactionPercentage}>
                  {item.percentage}%
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.satisfactionSummary}>
            <View style={styles.summaryItem}>
              <Icon name="star" size={20} color="#f59e0b" />
              <Text style={styles.summaryValue}>4.9/5.0</Text>
              <Text style={styles.summaryLabel}>Average Rating</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Icon name="thumbs-up" size={20} color="#10b981" />
              <Text style={styles.summaryValue}>91%</Text>
              <Text style={styles.summaryLabel}>Satisfaction</Text>
            </View>
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Performance Overview</Text>
          <View style={styles.performanceGrid}>
            {performanceMetrics.map((metric, index) => (
              <View key={index} style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <View
                    style={[
                      styles.performanceIcon,
                      {backgroundColor: `${metric.color}20`},
                    ]}>
                    <Icon name={metric.icon} size={18} color={metric.color} />
                  </View>
                  <Text
                    style={[
                      styles.performanceValue,
                      {color: metric.color},
                    ]}>
                    {metric.value}%
                  </Text>
                </View>
                <Text style={styles.performanceLabel}>{metric.label}</Text>
                <View style={styles.performanceBar}>
                  <View
                    style={[
                      styles.performanceProgress,
                      {width: `${metric.value}%`, backgroundColor: metric.color},
                    ]}
                  />
                </View>
                <Text style={styles.performanceTarget}>
                  Target: {metric.target}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Feedback */}
        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.chartTitle}>Recent Feedback</Text>
            <Text style={styles.subtitle}>
              {allFeedback.length} total reviews
            </Text>
          </View>
          {recentFeedback.map(feedback => (
            <View key={feedback.id} style={styles.feedbackItem}>
              <View style={styles.feedbackHeader}>
                <View style={styles.feedbackClient}>
                  <View style={styles.clientAvatar}>
                    <Icon name="user" size={16} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text style={styles.feedbackClientName}>
                      {feedback.client}
                    </Text>
                    <Text style={styles.feedbackDate}>{feedback.date}</Text>
                  </View>
                </View>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, index) => (
                    <Icon
                      key={index}
                      name="star"
                      size={14}
                      color={index < feedback.rating ? '#f59e0b' : '#d1d5db'}
                      style={{marginRight: 2}}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.feedbackComment}>{feedback.comment}</Text>
            </View>
          ))}
          
          {/* Pagination Controls */}
          {totalFeedbackPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  feedbackPage === 0 && styles.paginationButtonDisabled,
                ]}
                onPress={() => setFeedbackPage(feedbackPage - 1)}
                disabled={feedbackPage === 0}>
                <Icon
                  name="chevron-left"
                  size={18}
                  color={feedbackPage === 0 ? '#d1d5db' : '#8b5cf6'}
                />
              </TouchableOpacity>
              
              <View style={styles.pageIndicatorContainer}>
                {[...Array(totalFeedbackPages)].map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setFeedbackPage(index)}>
                    <View
                      style={[
                        styles.pageIndicator,
                        feedbackPage === index && styles.pageIndicatorActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  feedbackPage === totalFeedbackPages - 1 &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => setFeedbackPage(feedbackPage + 1)}
                disabled={feedbackPage === totalFeedbackPages - 1}>
                <Icon
                  name="chevron-right"
                  size={18}
                  color={feedbackPage === totalFeedbackPages - 1 ? '#d1d5db' : '#8b5cf6'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upcoming Schedule */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Upcoming Schedule</Text>
            <Text style={styles.scheduleCount}>
              {allSchedule.length} appointments
            </Text>
          </View>

          {upcomingSchedule.map(schedule => (
            <View key={schedule.id} style={styles.scheduleItem}>
              <View style={styles.scheduleIcon}>
                <Icon name="users" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleClient}>{schedule.client}</Text>
                <Text style={styles.scheduleDetails}>
                  {schedule.service} • {schedule.duration}
                </Text>
              </View>
              <View style={styles.scheduleRight}>
                <Text style={styles.scheduleTime}>{schedule.time}</Text>
                <View style={styles.statusBadge}>
                  <Icon
                    name={
                      schedule.status === 'confirmed'
                        ? 'check-circle'
                        : 'alert-circle'
                    }
                    size={14}
                    color={
                      schedule.status === 'confirmed' ? '#10b981' : '#f59e0b'
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      schedule.status === 'confirmed'
                        ? styles.confirmedText
                        : styles.pendingText,
                    ]}>
                    {schedule.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          
          {/* Pagination Controls */}
          {totalSchedulePages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  schedulePage === 0 && styles.paginationButtonDisabled,
                ]}
                onPress={() => setSchedulePage(schedulePage - 1)}
                disabled={schedulePage === 0}>
                <Icon
                  name="chevron-left"
                  size={18}
                  color={schedulePage === 0 ? '#d1d5db' : '#8b5cf6'}
                />
              </TouchableOpacity>
              
              <View style={styles.pageIndicatorContainer}>
                {[...Array(totalSchedulePages)].map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSchedulePage(index)}>
                    <View
                      style={[
                        styles.pageIndicator,
                        schedulePage === index && styles.pageIndicatorActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  schedulePage === totalSchedulePages - 1 &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => setSchedulePage(schedulePage + 1)}
                disabled={schedulePage === totalSchedulePages - 1}>
                <Icon
                  name="chevron-right"
                  size={18}
                  color={schedulePage === totalSchedulePages - 1 ? '#d1d5db' : '#8b5cf6'}
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
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  earningsIcon: {
    backgroundColor: '#a7f3d0',
  },
  clientsIcon: {
    backgroundColor: '#bfdbfe',
  },
  hoursIcon: {
    backgroundColor: '#bfdbfe',
  },
  ratingIcon: {
    backgroundColor: '#fde68a',
  },
  statBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeBadge: {
    color: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  excellentBadge: {
    color: '#10b981',
    backgroundColor: '#d1fae5',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  earningsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  clientsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  hoursCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  ratingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  chartWithAxis: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  yAxisContainer: {
    justifyContent: 'space-between',
    height: 150,
    marginRight: 8,
    paddingVertical: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLinesContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: 'space-between',
    zIndex: 0,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#f3f4f6',
    width: '100%',
  },
  xAxisLine: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e5e7eb',
    zIndex: 1,
  },
  chartScroll: {
    zIndex: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  barGroup: {
    alignItems: 'center',
    gap: 6,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    gap: 4,
  },
  earningsBar: {
    width: 20,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  hoursBar: {
    width: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginTop: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  barHours: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  barValueContainer: {
    alignItems: 'center',
    gap: 2,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  earningsLegend: {
    backgroundColor: '#10b981',
  },
  hoursLegend: {
    backgroundColor: '#3b82f6',
  },
  legendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  satisfactionContainer: {
    gap: 16,
    marginBottom: 20,
  },
  satisfactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  satisfactionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 8,
  },
  satisfactionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  satisfactionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  satisfactionBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  satisfactionBar: {
    height: '100%',
    borderRadius: 12,
  },
  satisfactionPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    width: 40,
    textAlign: 'right',
  },
  satisfactionSummary: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  performanceLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 12,
  },
  performanceBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  performanceProgress: {
    height: '100%',
    borderRadius: 3,
  },
  performanceTarget: {
    fontSize: 11,
    color: '#9ca3af',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  feedbackItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackClient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackClientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  feedbackComment: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scheduleCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  viewCalendar: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f9fafb',
    opacity: 0.5,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  pageIndicatorActive: {
    width: 24,
    backgroundColor: '#8b5cf6',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  scheduleDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  scheduleRight: {
    alignItems: 'flex-end',
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmedText: {
    color: '#10b981',
  },
  pendingText: {
    color: '#f59e0b',
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 20,
  },
  pieChartWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pieSlice: {
    position: 'absolute',
    width: 140,
    height: 140,
    left: 0,
    top: 0,
  },
  sliceInner: {
    position: 'absolute',
    width: 140,
    height: 70,
    backgroundColor: 'inherit',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    left: 0,
    top: 0,
    transformOrigin: '50% 100%',
  },
  pieLegend: {
    flex: 1,
    gap: 12,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pieLegendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieLegendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieLegendLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  pieLegendValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
});

export default CaregiverDashboardScreen;
