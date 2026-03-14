import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Linking,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CaregiverTabParamList} from '../../navigation/types';
import SideMenu from '../../components/SideMenu';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Booking {
  id: number;
  careReceiverName: string;
  careReceiverImage: string;
  serviceType: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  needs: string;
  status: 'confirmed' | 'pending' | 'completed';
  phoneNumber: string;
  email: string;
  careReceiverDetails: {
    age: number;
    gender: string;
    address: string;
    emergencyContact: {
      name: string;
      relation: string;
      phone: string;
    };
    medicalHistory: string[];
    biography: string;
  };
}

type CaregiverBookingsNavigationProp = NativeStackNavigationProp<
  CaregiverTabParamList,
  'Dashboard'
>;

const CaregiverBookingsScreen: React.FC = () => {
  const navigation = useNavigation<CaregiverBookingsNavigationProp>();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedContactBooking, setSelectedContactBooking] = useState<Booking | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [pendingRequestDetailsVisible, setPendingRequestDetailsVisible] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Initialize bookings state with empty array
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const apiBookings = await api.getCaregiverBookings();
      console.log('Fetched bookings from API:', apiBookings.length);
      console.log('Bookings statuses:', apiBookings.map((b: any) => ({ id: b._id, status: b.status })));
      
      // Transform API data to match component format
      const transformedBookings = apiBookings.map((booking: any) => ({
        id: booking._id,
        careReceiverName: booking.careReceiverId?.name || 'Unknown',
        careReceiverImage: booking.careReceiverId?.profileImage || 'https://via.placeholder.com/400',
        serviceType: booking.serviceType,
        date: new Date(booking.date),
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.location,
        needs: booking.needs || '',
        status: booking.status,
        phoneNumber: booking.careReceiverId?.phone || booking.careReceiverId?.phoneNumber || '',
        email: booking.careReceiverId?.email || '',
        careReceiverDetails: {
          age: booking.careReceiverId?.age || 0,
          gender: booking.careReceiverId?.gender || '',
          address: booking.careReceiverId?.address || booking.location,
          emergencyContact: booking.careReceiverId?.emergencyContact || {
            name: '',
            relation: '',
            phone: '',
          },
          medicalHistory: booking.careReceiverId?.medicalHistory || [],
          biography: booking.careReceiverId?.biography || '',
        },
      }));
      
      console.log('Transformed bookings:', transformedBookings.length);
      console.log('Completed bookings:', transformedBookings.filter((b: any) => b.status === 'completed').length);
      setBookings(transformedBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch pending requests from API
  useEffect(() => {
    // Check authentication before fetching
    const checkAuthAndFetch = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        
        if (!token || !user) {
          console.log('No token or user found');
          Alert.alert('Authentication Required', 'Please log in to view pending requests');
          return;
        }
        
        const parsedUser = JSON.parse(user);
        console.log('User role:', parsedUser.role);
        
        if (parsedUser.role !== 'caregiver') {
          console.log('User is not a caregiver');
          Alert.alert('Access Denied', 'Only caregivers can view this page');
          return;
        }
        
        fetchPendingRequests();
        fetchBookings();
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    
    checkAuthAndFetch();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      console.log('Fetching pending requests...');
      const requests = await api.getPendingRequests();
      console.log('Received pending requests:', requests);
      
      // Transform API data to match component format
      const transformedRequests = requests.map((request: any) => ({
        id: request._id,
        careReceiverName: request.careReceiverId?.name || 'Unknown',
        careReceiverImage: request.careReceiverId?.profileImage || 'https://via.placeholder.com/400',
        serviceType: request.serviceType,
        requestedDate: new Date(request.requestedDate),
        startTime: request.startTime,
        endTime: request.endTime,
        location: request.location,
        specialNeeds: request.specialNeeds || '',
        hourlyRate: request.hourlyRate,
        requestDate: getRelativeTime(request.createdAt),
        careReceiverId: request.careReceiverId, // Keep full care receiver data
      }));
      
      setPendingRequests(transformedRequests);
    } catch (error: any) {
      console.error('Error fetching pending requests:', error);
      console.error('Error details:', error.response?.data);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to login screen
                // navigation.reset({
                //   index: 0,
                //   routes: [{ name: 'Login' }],
                // });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load pending requests');
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const upcomingBookings = bookings.filter(
    b => b.date >= new Date(new Date().setHours(0, 0, 0, 0)) && b.status !== 'completed'
  ).sort((a, b) => {
    // Sort pending bookings first, then by date
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return a.date.getTime() - b.date.getTime();
  });

  const completedBookings = bookings.filter(
    b => b.status === 'completed'
  ).sort((a, b) => b.date.getTime() - a.date.getTime());

  console.log('Upcoming bookings count:', upcomingBookings.length);
  console.log('Completed bookings count:', completedBookings.length);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openCallModal = (booking: Booking) => {
    setSelectedContactBooking(booking);
    setCallModalVisible(true);
  };

  const openMessageModal = (booking: Booking) => {
    setSelectedContactBooking(booking);
    setMessageModalVisible(true);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasBookingOnDate = (date: Date) => {
    return upcomingBookings.some(booking => 
      booking.date.getDate() === date.getDate() &&
      booking.date.getMonth() === date.getMonth() &&
      booking.date.getFullYear() === date.getFullYear() &&
      booking.status === 'confirmed'
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleApproveRequest = (request: any) => {
    Alert.alert(
      'Approve Request',
      `Accept booking request from ${request.careReceiverName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await api.approveBookingRequest(request.id);
              Alert.alert('Success', 'Request approved successfully!');
              // Refresh pending requests
              fetchPendingRequests();
            } catch (error) {
              console.error('Error approving request:', error);
              Alert.alert('Error', 'Failed to approve request. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleApproveBooking = async (booking: Booking) => {
    Alert.alert(
      'Approve Booking',
      `Confirm this booking with ${booking.careReceiverName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await api.approveBooking(booking.id.toString());
              Alert.alert('Success', 'Booking has been approved!');
              // Refresh bookings
              fetchBookings();
            } catch (error) {
              console.error('Error approving booking:', error);
              Alert.alert('Error', 'Failed to approve booking. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleRejectBooking = (booking: Booking) => {
    setSelectedRequest({
      id: booking.id,
      careReceiverName: booking.careReceiverName,
      careReceiverImage: booking.careReceiverImage,
      serviceType: booking.serviceType,
    });
    setRejectionReason('');
    setRejectionModalVisible(true);
  };

  const handleRejectRequest = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectionModalVisible(true);
  };

  const handleCompleteBooking = async (booking: Booking) => {
    Alert.alert(
      'Complete Booking',
      `Mark this booking with ${booking.careReceiverName} as completed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          style: 'default',
          onPress: async () => {
            try {
              await api.completeBooking(booking.id.toString());
              Alert.alert('Success', 'Booking has been marked as completed!');
              // Refresh bookings
              fetchBookings();
            } catch (error) {
              console.error('Error completing booking:', error);
              Alert.alert('Error', 'Failed to complete booking. Please try again.');
            }
          },
        },
      ],
    );
  };

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for rejection');
      return;
    }

    try {
      const isBooking = selectedRequest.serviceType && !selectedRequest.specialNeeds;
      
      if (isBooking) {
        // Rejecting a booking
        await api.rejectBooking(selectedRequest.id, rejectionReason.trim());
      } else {
        // Rejecting a request
        await api.rejectBookingRequest(selectedRequest.id, rejectionReason.trim());
      }
      
      Alert.alert(
        'Success',
        `${isBooking ? 'Booking' : 'Request'} from ${selectedRequest.careReceiverName} has been rejected.`,
      );
      setRejectionModalVisible(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      // Refresh data
      fetchPendingRequests();
      fetchBookings();
    } catch (error) {
      console.error('Error rejecting:', error);
      Alert.alert('Error', 'Failed to reject. Please try again.');
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const hasBooking = hasBookingOnDate(date);
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
      
      days.push(
        <View key={day} style={styles.calendarDay}>
          <View style={[
            styles.calendarDayContent,
            isToday && styles.calendarDayToday,
            hasBooking && styles.calendarDayBooked
          ]}>
            <Text style={[
              styles.calendarDayText,
              isToday && styles.calendarDayTextToday,
              hasBooking && styles.calendarDayTextBooked
            ]}>
              {day}
            </Text>
          </View>
          {hasBooking && <View style={styles.bookingDot} />}
        </View>
      );
    }
    
    return days;
  };

  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => setSelectedBooking(booking)}>
      <View style={styles.bookingHeader}>
        <View style={styles.dateBox}>
          <Text style={styles.dateMonth}>
            {booking.date.toLocaleDateString('default', { month: 'short' }).toUpperCase()}
          </Text>
          <Text style={styles.dateDay}>{booking.date.getDate()}</Text>
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.careReceiverName}>{booking.careReceiverName}</Text>
          <Text style={styles.serviceType}>{booking.serviceType}</Text>
          <View style={styles.timeRow}>
            <Icon name="clock" size={14} color="#6b7280" />
            <Text style={styles.timeText}>
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, 
          booking.status === 'confirmed' ? styles.confirmedBadge :
          booking.status === 'pending' ? styles.statusPendingBadge :
          styles.completedBadge
        ]}>
          <Text style={[styles.statusText,
            booking.status === 'confirmed' ? styles.confirmedText :
            booking.status === 'pending' ? styles.pendingText :
            styles.completedText
          ]}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Icon name="map-pin" size={14} color="#6b7280" />
        <Text style={styles.locationText} numberOfLines={1}>{booking.location}</Text>
      </View>

      {booking.needs && (
        <View style={styles.needsBox}>
          <Icon name="alert-circle" size={14} color="#f59e0b" />
          <Text style={styles.needsText} numberOfLines={2}>{booking.needs}</Text>
        </View>
      )}

      {booking.status === 'pending' ? (
        <View style={styles.pendingActionsRow}>
          <TouchableOpacity
            style={styles.bookingRejectButton}
            onPress={() => handleRejectBooking(booking)}>
            <Icon name="x" size={14} color="#ef4444" />
            <Text style={styles.bookingRejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookingApproveButton}
            onPress={() => handleApproveBooking(booking)}>
            <Icon name="check" size={14} color="#fff" />
            <Text style={styles.bookingApproveText}>Approve</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openCallModal(booking)}>
              <Icon name="phone" size={16} color="#8b5cf6" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openMessageModal(booking)}>
              <Icon name="mail" size={16} color="#8b5cf6" />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setSelectedBooking(booking)}>
              <Icon name="eye" size={16} color="#8b5cf6" />
              <Text style={styles.actionButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
          {booking.status === 'confirmed' && (
            <TouchableOpacity
              style={styles.completeBookingButton}
              onPress={() => handleCompleteBooking(booking)}>
              <Icon name="check-circle" size={16} color="#fff" />
              <Text style={styles.completeBookingText}>Mark as Complete</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </TouchableOpacity>
  );

  const renderCompletedBookingsTable = () => (
    <View style={styles.tableWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}>
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableDateColumn]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.tableClientColumn]}>Client</Text>
            <Text style={[styles.tableHeaderText, styles.tableServiceColumn]}>Service</Text>
            <Text style={[styles.tableHeaderText, styles.tableTimeColumn]}>Time</Text>
            <Text style={[styles.tableHeaderText, styles.tableActionColumn]}>Action</Text>
          </View>

          {/* Table Rows */}
          {completedBookings.map((booking) => (
            <View key={booking.id} style={styles.tableRow}>
              <View style={styles.tableDateColumn}>
                <Text style={styles.tableDateText}>
                  {booking.date.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.tableYearText}>
                  {booking.date.getFullYear()}
                </Text>
              </View>
              
              <View style={styles.tableClientColumn}>
                <View style={styles.tableClientContent}>
                  <Image
                    source={{ uri: booking.careReceiverImage }}
                    style={styles.tableAvatar}
                  />
                  <Text style={styles.tableClientText} numberOfLines={1}>
                    {booking.careReceiverName}
                  </Text>
                </View>
              </View>
              
              <View style={styles.tableServiceColumn}>
                <Text style={styles.tableServiceText} numberOfLines={2}>
                  {booking.serviceType}
                </Text>
              </View>
              
              <View style={styles.tableTimeColumn}>
                <View style={styles.tableTimeContent}>
                  <Icon name="clock" size={12} color="#6b7280" />
                  <Text style={styles.tableTimeText}>
                    {booking.startTime}
                  </Text>
                </View>
                <Text style={styles.tableTimeDuration}>
                  {booking.endTime}
                </Text>
              </View>
              
              <View style={styles.tableActionColumn}>
                <TouchableOpacity
                  style={styles.tableActionButton}
                  onPress={() => setSelectedBooking(booking)}>
                  <Icon name="eye" size={16} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
            <Icon name="chevron-left" size={20} color="#8b5cf6" />
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
            <Icon name="chevron-right" size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarWeekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {renderCalendar()}
        </View>
        
        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={styles.legendText}>Confirmed Bookings</Text>
          </View>
        </View>
      </View>

      {/* Pending Requests */}
      {loadingRequests ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading pending requests...</Text>
        </View>
      ) : pendingRequests.length > 0 ? (
        <View style={styles.pendingSection}>
          <View style={styles.pendingHeader}>
            <Text style={styles.pendingSectionTitle}>Pending Requests</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingRequests.length}</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pendingScroll}>
            {pendingRequests.map(request => (
              <View key={request.id} style={styles.pendingCard}>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedPendingRequest(request);
                    setPendingRequestDetailsVisible(true);
                  }}
                  activeOpacity={0.7}>
                  <View style={styles.pendingCardHeader}>
                  <Image
                    source={{ uri: request.careReceiverImage }}
                    style={styles.pendingAvatar}
                  />
                  <View style={styles.pendingClientInfo}>
                    <Text style={styles.pendingClientName}>{request.careReceiverName}</Text>
                    <Text style={styles.pendingRequestDate}>{request.requestDate}</Text>
                  </View>
                </View>

                <View style={styles.pendingDetails}>
                  <View style={styles.pendingDetailRow}>
                    <Icon name="briefcase" size={14} color="#6b7280" />
                    <Text style={styles.pendingDetailText}>{request.serviceType}</Text>
                  </View>
                  <View style={styles.pendingDetailRow}>
                    <Icon name="calendar" size={14} color="#6b7280" />
                    <Text style={styles.pendingDetailText}>
                      {request.requestedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.pendingDetailRow}>
                    <Icon name="clock" size={14} color="#6b7280" />
                    <Text style={styles.pendingDetailText}>
                      {request.startTime} - {request.endTime}
                    </Text>
                  </View>
                  <View style={styles.pendingDetailRow}>
                    <Icon name="dollar-sign" size={14} color="#6b7280" />
                    <Text style={styles.pendingDetailText}>LKR {request.hourlyRate}/hr</Text>
                  </View>
                </View>

                {request.specialNeeds && (
                  <View style={styles.pendingSpecialNeeds}>
                    <Icon name="alert-circle" size={12} color="#8b5cf6" />
                    <Text style={styles.pendingSpecialNeedsText} numberOfLines={2}>
                      {request.specialNeeds}
                    </Text>
                  </View>
                )}
                </TouchableOpacity>

                <View style={styles.pendingActionsIconRow}>
                  <TouchableOpacity
                    style={styles.pendingActionIcon}
                    onPress={() => {
                      const phone = request.careReceiverId?.phone || request.careReceiverId?.phoneNumber;
                      if (phone) handleCall(phone);
                    }}>
                    <Icon name="phone" size={16} color="#8b5cf6" />
                    <Text style={styles.pendingActionIconText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pendingActionIcon}
                    onPress={() => request.careReceiverId?.email && handleEmail(request.careReceiverId.email)}>
                    <Icon name="mail" size={16} color="#8b5cf6" />
                    <Text style={styles.pendingActionIconText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pendingActionIcon}
                    onPress={() => {
                      setSelectedPendingRequest(request);
                      setPendingRequestDetailsVisible(true);
                    }}>
                    <Icon name="eye" size={16} color="#8b5cf6" />
                    <Text style={styles.pendingActionIconText}>Details</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={styles.pendingRejectButton}
                    onPress={() => handleRejectRequest(request)}>
                    <Icon name="x" size={16} color="#ef4444" />
                    <Text style={styles.pendingRejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pendingApproveButton}
                    onPress={() => handleApproveRequest(request)}>
                    <Icon name="check" size={16} color="#fff" />
                    <Text style={styles.pendingApproveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}>
          <Icon name="calendar" size={18} color={activeTab === 'upcoming' ? '#8b5cf6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}>
          <Icon name="check-circle" size={18} color={activeTab === 'completed' ? '#8b5cf6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed ({completedBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}>
        {activeTab === 'upcoming' ? (
          upcomingBookings.length > 0 ? (
            upcomingBookings.map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>No Upcoming Bookings</Text>
              <Text style={styles.emptyStateText}>You don't have any scheduled appointments</Text>
            </View>
          )
        ) : (
          completedBookings.length > 0 ? (
            renderCompletedBookingsTable()
          ) : (
            <View style={styles.emptyState}>
              <Icon name="check-circle" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>No Completed Bookings</Text>
              <Text style={styles.emptyStateText}>Your completed appointments will appear here</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={selectedBooking !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedBooking(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                <Icon name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedBooking && (
                <>
                  {/* Profile Section */}
                  <View style={styles.profileSection}>
                    <Image
                      source={{ uri: selectedBooking.careReceiverImage }}
                      style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{selectedBooking.careReceiverName}</Text>
                      <View style={styles.profileTags}>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{selectedBooking.careReceiverDetails.age} years</Text>
                        </View>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{selectedBooking.careReceiverDetails.gender}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Emergency Contact */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="alert-circle" size={18} color="#ef4444" />
                      <Text style={styles.sectionTitle}>Emergency Contact</Text>
                    </View>
                    <View style={styles.emergencyBox}>
                      <Text style={styles.emergencyName}>
                        {selectedBooking.careReceiverDetails.emergencyContact.name}
                      </Text>
                      <Text style={styles.emergencyRelation}>
                        {selectedBooking.careReceiverDetails.emergencyContact.relation}
                      </Text>
                      <TouchableOpacity
                        style={styles.emergencyCallButton}
                        onPress={() => handleCall(selectedBooking.careReceiverDetails.emergencyContact.phone)}>
                        <Icon name="phone" size={16} color="#ef4444" />
                        <Text style={styles.emergencyPhone}>
                          {selectedBooking.careReceiverDetails.emergencyContact.phone}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Medical History */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="file-text" size={18} color="#3b82f6" />
                      <Text style={styles.sectionTitle}>Medical History</Text>
                    </View>
                    <View style={styles.medicalBox}>
                      {selectedBooking.careReceiverDetails.medicalHistory.map((item, idx) => (
                        <View key={idx} style={styles.medicalItem}>
                          <Icon name="check" size={14} color="#3b82f6" />
                          <Text style={styles.medicalText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Biography */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="user" size={18} color="#6b7280" />
                      <Text style={styles.sectionTitle}>About</Text>
                    </View>
                    <Text style={styles.biographyText}>
                      {selectedBooking.careReceiverDetails.biography}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedBooking(null)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
              {selectedBooking && (
                <TouchableOpacity
                  style={styles.modalCallButton}
                  onPress={() => {
                    setSelectedBooking(null);
                    handleCall(selectedBooking.phoneNumber);
                  }}>
                  <Icon name="phone" size={16} color="#fff" />
                  <Text style={styles.modalCallText}>Call Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Call Modal */}
      <Modal
        visible={callModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCallModalVisible(false)}>
        <View style={styles.contactModalOverlay}>
          <View style={styles.contactModalContent}>
            <View style={styles.contactModalHeader}>
              <View style={styles.contactIconCircle}>
                <Icon name="phone" size={32} color="#8b5cf6" />
              </View>
              <Text style={styles.contactModalTitle}>Make a Call</Text>
              <TouchableOpacity 
                style={styles.contactModalClose}
                onPress={() => setCallModalVisible(false)}>
                <Icon name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {selectedContactBooking && (
              <>
                <View style={styles.contactDetailsBox}>
                  <Image
                    source={{ uri: selectedContactBooking.careReceiverImage }}
                    style={styles.contactModalImage}
                  />
                  <Text style={styles.contactModalName}>
                    {selectedContactBooking.careReceiverName}
                  </Text>
                  <Text style={styles.contactModalService}>
                    {selectedContactBooking.serviceType}
                  </Text>
                  <Text style={styles.contactModalDate}>
                    {selectedContactBooking.date.toLocaleDateString('default', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })} • {selectedContactBooking.startTime} - {selectedContactBooking.endTime}
                  </Text>
                </View>

                <View style={styles.contactActionBox}>
                  <Text style={styles.contactLabel}>Phone Number</Text>
                  <Text style={styles.contactValue}>{selectedContactBooking.phoneNumber}</Text>
                  
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => {
                      setCallModalVisible(false);
                      handleCall(selectedContactBooking.phoneNumber);
                    }}>
                    <Icon name="phone" size={20} color="#fff" />
                    <Text style={styles.primaryActionText}>Call Now</Text>
                  </TouchableOpacity>

                  <Text style={styles.emergencyLabel}>Emergency Contact</Text>
                  <Text style={styles.emergencyContactName}>
                    {selectedContactBooking.careReceiverDetails.emergencyContact.name}
                  </Text>
                  <Text style={styles.emergencyContactRelation}>
                    {selectedContactBooking.careReceiverDetails.emergencyContact.relation}
                  </Text>
                  <TouchableOpacity
                    style={styles.secondaryActionButton}
                    onPress={() => {
                      setCallModalVisible(false);
                      handleCall(selectedContactBooking.careReceiverDetails.emergencyContact.phone);
                    }}>
                    <Icon name="phone" size={18} color="#ef4444" />
                    <Text style={styles.secondaryActionText}>
                      {selectedContactBooking.careReceiverDetails.emergencyContact.phone}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
      <Modal
        visible={messageModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMessageModalVisible(false)}>
        <View style={styles.contactModalOverlay}>
          <View style={styles.contactModalContent}>
            <View style={styles.contactModalHeader}>
              <View style={styles.contactIconCircle}>
                <Icon name="mail" size={32} color="#8b5cf6" />
              </View>
              <Text style={styles.contactModalTitle}>Send Message</Text>
              <TouchableOpacity 
                style={styles.contactModalClose}
                onPress={() => setMessageModalVisible(false)}>
                <Icon name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {selectedContactBooking && (
              <>
                <View style={styles.contactDetailsBox}>
                  <Image
                    source={{ uri: selectedContactBooking.careReceiverImage }}
                    style={styles.contactModalImage}
                  />
                  <Text style={styles.contactModalName}>
                    {selectedContactBooking.careReceiverName}
                  </Text>
                  <Text style={styles.contactModalService}>
                    {selectedContactBooking.serviceType}
                  </Text>
                  <Text style={styles.contactModalDate}>
                    {selectedContactBooking.date.toLocaleDateString('default', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })} • {selectedContactBooking.startTime} - {selectedContactBooking.endTime}
                  </Text>
                </View>

                <View style={styles.contactActionBox}>
                  <Text style={styles.contactLabel}>Email Address</Text>
                  <Text style={styles.contactValue}>{selectedContactBooking.email}</Text>
                  
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => {
                      setMessageModalVisible(false);
                      handleEmail(selectedContactBooking.email);
                    }}>
                    <Icon name="mail" size={20} color="#fff" />
                    <Text style={styles.primaryActionText}>Send Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryActionButton, { backgroundColor: '#10b981', marginTop: 12 }]}
                    onPress={() => {
                      setMessageModalVisible(false);
                      Linking.openURL(`sms:${selectedContactBooking.phoneNumber}`);
                    }}>
                    <Icon name="message-circle" size={20} color="#fff" />
                    <Text style={styles.primaryActionText}>Send SMS</Text>
                  </TouchableOpacity>

                  <View style={styles.messageInfoBox}>
                    <Icon name="info" size={16} color="#6b7280" />
                    <Text style={styles.messageInfoText}>
                      Booking on {selectedContactBooking.date.toLocaleDateString('default', { month: 'short', day: 'numeric' })} at {selectedContactBooking.startTime}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        visible={rejectionModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setRejectionModalVisible(false)}>
        <View style={styles.rejectionModalOverlay}>
          <View style={styles.rejectionModalContent}>
            <View style={styles.rejectionModalHeader}>
              <Text style={styles.rejectionModalTitle}>Reject Request</Text>
              <TouchableOpacity
                onPress={() => setRejectionModalVisible(false)}
                style={styles.rejectionModalClose}>
                <Icon name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <View style={styles.rejectionModalBody}>
                <View style={styles.rejectionClientInfo}>
                  <Image
                    source={{ uri: selectedRequest.careReceiverImage }}
                    style={styles.rejectionClientAvatar}
                  />
                  <View>
                    <Text style={styles.rejectionClientName}>{selectedRequest.careReceiverName}</Text>
                    <Text style={styles.rejectionServiceType}>{selectedRequest.serviceType}</Text>
                  </View>
                </View>

                <Text style={styles.rejectionLabel}>Reason for Rejection *</Text>
                <TextInput
                  style={styles.rejectionInput}
                  placeholder="Please provide a reason for declining this request..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  textAlignVertical="top"
                />

                <View style={styles.rejectionHintBox}>
                  <Icon name="info" size={16} color="#6b7280" />
                  <Text style={styles.rejectionHint}>
                    The client will be notified with your reason. Be professional and courteous.
                  </Text>
                </View>

                <View style={styles.rejectionActions}>
                  <TouchableOpacity
                    style={styles.rejectionCancelButton}
                    onPress={() => setRejectionModalVisible(false)}>
                    <Text style={styles.rejectionCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectionConfirmButton}
                    onPress={confirmRejection}>
                    <Icon name="x-circle" size={18} color="#fff" />
                    <Text style={styles.rejectionConfirmText}>Reject Request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Pending Request Details Modal */}
      <Modal
        visible={pendingRequestDetailsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPendingRequestDetailsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={() => setPendingRequestDetailsVisible(false)}>
                <Icon name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedPendingRequest && (
                <>
                  {/* Profile Section */}
                  <View style={styles.profileSection}>
                    <Image
                      source={{ uri: selectedPendingRequest.careReceiverImage }}
                      style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{selectedPendingRequest.careReceiverName}</Text>
                      <View style={styles.profileTags}>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{selectedPendingRequest.serviceType}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Request Information */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="calendar" size={18} color="#8b5cf6" />
                      <Text style={styles.sectionTitle}>Booking Details</Text>
                    </View>
                    <View style={styles.requestDetailBox}>
                      <View style={styles.requestDetailRow}>
                        <Icon name="calendar" size={16} color="#6b7280" />
                        <View style={styles.requestDetailContent}>
                          <Text style={styles.requestDetailLabel}>Date</Text>
                          <Text style={styles.requestDetailValue}>
                            {selectedPendingRequest.requestedDate.toLocaleDateString('default', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestDetailRow}>
                        <Icon name="clock" size={16} color="#6b7280" />
                        <View style={styles.requestDetailContent}>
                          <Text style={styles.requestDetailLabel}>Time</Text>
                          <Text style={styles.requestDetailValue}>
                            {selectedPendingRequest.startTime} - {selectedPendingRequest.endTime}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestDetailRow}>
                        <Icon name="map-pin" size={16} color="#6b7280" />
                        <View style={styles.requestDetailContent}>
                          <Text style={styles.requestDetailLabel}>Location</Text>
                          <Text style={styles.requestDetailValue}>
                            {selectedPendingRequest.location}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestDetailRow}>
                        <Icon name="dollar-sign" size={16} color="#6b7280" />
                        <View style={styles.requestDetailContent}>
                          <Text style={styles.requestDetailLabel}>Rate</Text>
                          <Text style={styles.requestDetailValue}>
                            LKR {selectedPendingRequest.hourlyRate}/hour
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Special Needs */}
                  {selectedPendingRequest.specialNeeds && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Icon name="alert-circle" size={18} color="#f59e0b" />
                        <Text style={styles.sectionTitle}>Special Requirements</Text>
                      </View>
                      <View style={styles.specialNeedsDetailBox}>
                        <Text style={styles.specialNeedsDetailText}>
                          {selectedPendingRequest.specialNeeds}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Request Timeline */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="info" size={18} color="#6b7280" />
                      <Text style={styles.sectionTitle}>Request Information</Text>
                    </View>
                    <View style={styles.requestTimelineBox}>
                      <Text style={styles.requestTimelineText}>
                        Requested {selectedPendingRequest.requestDate}
                      </Text>
                      <View style={styles.requestStatusBadge}>
                        <Icon name="clock" size={12} color="#f59e0b" />
                        <Text style={styles.requestStatusText}>Awaiting Response</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalRejectButton}
                onPress={() => {
                  setPendingRequestDetailsVisible(false);
                  if (selectedPendingRequest) {
                    handleRejectRequest(selectedPendingRequest);
                  }
                }}>
                <Icon name="x" size={16} color="#ef4444" />
                <Text style={styles.modalRejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApproveButton}
                onPress={() => {
                  setPendingRequestDetailsVisible(false);
                  if (selectedPendingRequest) {
                    handleApproveRequest(selectedPendingRequest);
                  }
                }}>
                <Icon name="check" size={16} color="#fff" />
                <Text style={styles.modalApproveText}>Approve Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  activeTab: {
    backgroundColor: '#ede9fe',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#8b5cf6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bookingHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  dateBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  bookingInfo: {
    flex: 1,
  },
  careReceiverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confirmedBadge: {
    backgroundColor: '#d1fae5',
  },
  statusPendingBadge: {
    backgroundColor: '#fef3c7',
  },
  completedBadge: {
    backgroundColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  confirmedText: {
    color: '#10b981',
  },
  pendingText: {
    color: '#f59e0b',
  },
  completedText: {
    color: '#6b7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  needsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  needsText: {
    fontSize: 13,
    color: '#92400e',
    flex: 1,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalScroll: {
    maxHeight: 500,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  profileTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emergencyBox: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emergencyRelation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  emergencyCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyPhone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  medicalBox: {
    gap: 8,
  },
  medicalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  medicalText: {
    fontSize: 14,
    color: '#374151',
  },
  biographyText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalCloseButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalCallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
  },
  modalCallText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  calendarDayContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDayToday: {
    backgroundColor: '#f3f4f6',
  },
  calendarDayBooked: {
    backgroundColor: '#ede9fe',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#374151',
  },
  calendarDayTextToday: {
    fontWeight: '700',
    color: '#111827',
  },
  calendarDayTextBooked: {
    fontWeight: '700',
    color: '#8b5cf6',
  },
  bookingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8b5cf6',
    position: 'absolute',
    bottom: 4,
  },
  calendarLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  contactModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contactModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  contactModalHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    position: 'relative',
  },
  contactIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  contactModalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDetailsBox: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contactModalImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  contactModalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  contactModalService: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  contactModalDate: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  contactActionBox: {
    padding: 20,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  contactValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 16,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  emergencyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  emergencyContactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  emergencyContactRelation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  messageInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  messageInfoText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  pendingSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pendingSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  pendingBadge: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  pendingScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pendingCard: {
    width: 280,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  pendingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  pendingClientInfo: {
    flex: 1,
  },
  pendingClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  pendingRequestDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  pendingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  pendingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingDetailText: {
    fontSize: 13,
    color: '#374151',
  },
  pendingSpecialNeeds: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#f3e8ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  pendingSpecialNeedsText: {
    fontSize: 12,
    color: '#6b21a8',
    flex: 1,
    lineHeight: 16,
  },
  pendingActionsIconRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9d5ff',
  },
  pendingActionIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  pendingActionIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  pendingRejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  pendingRejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  pendingApproveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#8b5cf6',
  },
  pendingApproveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  rejectionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rejectionModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 450,
  },
  rejectionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rejectionModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  rejectionModalClose: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectionModalBody: {
    padding: 20,
  },
  rejectionClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  rejectionClientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  rejectionClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  rejectionServiceType: {
    fontSize: 13,
    color: '#6b7280',
  },
  rejectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  rejectionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    marginBottom: 12,
  },
  rejectionHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  rejectionHint: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    lineHeight: 16,
  },
  rejectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectionCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  rejectionCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  rejectionConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
  },
  rejectionConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  pendingActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bookingRejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  bookingRejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  bookingApproveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  bookingApproveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  tableWrapper: {
    flex: 1,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 600,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  tableDateColumn: {
    width: 80,
  },
  tableDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  tableYearText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  tableClientColumn: {
    width: 160,
    paddingHorizontal: 8,
  },
  tableClientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tableClientText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  tableServiceColumn: {
    width: 140,
    paddingHorizontal: 8,
  },
  tableServiceText: {
    fontSize: 12,
    color: '#6b7280',
  },
  tableTimeColumn: {
    width: 80,
    paddingHorizontal: 8,
  },
  tableTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  tableTimeDuration: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  tableActionColumn: {
    width: 60,
    alignItems: 'center',
  },
  tableActionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestDetailBox: {
    gap: 16,
  },
  requestDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  requestDetailContent: {
    flex: 1,
  },
  requestDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  requestDetailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  specialNeedsDetailBox: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  specialNeedsDetailText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  requestTimelineBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  requestTimelineText: {
    fontSize: 14,
    color: '#6b7280',
  },
  requestStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  requestStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  modalRejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  modalRejectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalApproveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10b981',
  },
  modalApproveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completeBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#10b981',
    marginTop: 8,
  },
  completeBookingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CaregiverBookingsScreen;
