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
import {
  WelcomeCard,
  StatCard,
  UpcomingCard,
  SectionCard,
} from '../../components/cards';

type CaregiverDashboardScreenProps = {
  navigation: NativeStackNavigationProp<CaregiverTabParamList, 'Dashboard'>;
};

const CaregiverDashboardScreen: React.FC<CaregiverDashboardScreenProps> = ({
  navigation,
}) => {
  const {user} = useAuth();
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
          <ActivityIndicator size="large" color="#7C3AED" />
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
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
            colors={['#7C3AED']}
          />
        }>
        {/* Welcome Card */}
        <View style={{paddingHorizontal: 16}}>
          <WelcomeCard
            name={firstName}
            role="Caregiver"
            themeColor="#7C3AED"
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="dollar-sign"
            value={`LKR ${dashboardStats.earnings.toLocaleString()}`}
            label="Total Earnings"
            color="#10B981"
          />
          <StatCard
            icon="users"
            value={dashboardStats.clients.toString()}
            label="Active Clients"
            color="#2563EB"
          />
          <StatCard
            icon="clock"
            value={dashboardStats.hours.toString()}
            label="Hours This Week"
            color="#7C3AED"
          />
          <StatCard
            icon="star"
            value={dashboardStats.rating.toFixed(1)}
            label="Average Rating"
            color="#F59E0B"
          />
        </View>

        {/* Upcoming Schedule */}
        <SectionCard
          title="Upcoming Schedule"
          subtitle={`${allSchedule.length} appointments`}
          style={styles.section}>
          {upcomingSchedule.length > 0 ? (
            <>
              {upcomingSchedule.map(schedule => (
                <UpcomingCard
                  key={schedule.id}
                  title={schedule.client}
                  subtitle={`${schedule.service} • ${schedule.duration}`}
                  time={schedule.time}
                  status={schedule.status}
                  icon="users"
                  iconColor="#7C3AED"
                  style={styles.upcomingItem}
                />
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
                      color={schedulePage === 0 ? '#d1d5db' : '#7C3AED'}
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
                      color={schedulePage === totalSchedulePages - 1 ? '#d1d5db' : '#7C3AED'}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No upcoming appointments</Text>
            </View>
          )}
        </SectionCard>

        {/* Performance Overview */}
        {performanceMetrics.length > 0 && (
          <SectionCard title="Performance Overview" style={styles.section}>
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
                      style={[styles.performanceValue, {color: metric.color}]}>
                      {metric.value}%
                    </Text>
                  </View>
                  <Text style={styles.performanceLabel}>{metric.label}</Text>
                  <View style={styles.performanceBar}>
                    <View
                      style={[
                        styles.performanceProgress,
                        {
                          width: `${metric.value}%`,
                          backgroundColor: metric.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.performanceTarget}>
                    Target: {metric.target}%
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {/* Client Satisfaction */}
        {clientSatisfaction.length > 0 && (
          <SectionCard
            title="Client Satisfaction"
            subtitle="Based on 80 reviews"
            style={styles.section}>
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
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        },
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
          </SectionCard>
        )}

        {/* Recent Feedback */}
        <SectionCard
          title="Recent Feedback"
          subtitle={`${allFeedback.length} total reviews`}
          style={styles.section}>
          {recentFeedback.length > 0 ? (
            <>
              {recentFeedback.map(feedback => (
                <View key={feedback.id} style={styles.feedbackItem}>
                  <View style={styles.feedbackHeader}>
                    <View style={styles.feedbackClient}>
                      <View style={styles.clientAvatar}>
                        <Icon name="user" size={16} color="#7C3AED" />
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
                      color={feedbackPage === 0 ? '#d1d5db' : '#7C3AED'}
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
                      color={feedbackPage === totalFeedbackPages - 1 ? '#d1d5db' : '#7C3AED'}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="message-circle" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No feedback yet</Text>
            </View>
          )}
        </SectionCard>
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
  scrollViewContent: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  upcomingItem: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
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
    backgroundColor: '#7C3AED',
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
});

export default CaregiverDashboardScreen;
