import React, {useState, useEffect} from 'react';
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

interface PendingRequest {
  id: number;
  careReceiverName: string;
  careReceiverImage: string;
  serviceType: string;
  requestedDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  specialNeeds?: string;
  hourlyRate: number;
  requestDate: string;
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
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Pending requests state
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<PendingRequest | null>(null);
  const [pendingRequestDetailsVisible, setPendingRequestDetailsVisible] = useState(false);
  
  // Rejection modal state
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Contact modals state
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedContactBooking, setSelectedContactBooking] = useState<Booking | null>(null);

  // Mock data
  const upcomingBookings: Booking[] = [
    {
      id: 1,
      careReceiverName: 'Eleanor Martinez',
      careReceiverImage: 'https://i.pravatar.cc/150?img=1',
      serviceType: 'Medical Care',
      date: new Date(2024, 2, 15),
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      location: '123 Oak Street, Springfield',
      needs: 'Medication administration, Blood pressure monitoring',
      status: 'confirmed',
      phoneNumber: '+1 (555) 123-4567',
      email: 'eleanor.m@email.com',
      careReceiverDetails: {
        age: 78,
        gender: 'Female',
        address: '123 Oak Street, Springfield, IL 62701',
        emergencyContact: {
          name: 'Sarah Martinez',
          relation: 'Daughter',
          phone: '+1 (555) 987-6543',
        },
        medicalHistory: [
          'Type 2 Diabetes',
          'Hypertension',
          'Osteoarthritis',
        ],
        biography: 'Eleanor is a retired teacher who loves gardening and classical music. She requires assistance with daily medication and mobility support.',
      },
    },
    {
      id: 2,
      careReceiverName: 'Robert Chen',
      careReceiverImage: 'https://i.pravatar.cc/150?img=12',
      serviceType: 'Companionship',
      date: new Date(2024, 2, 18),
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      location: '456 Maple Avenue, Portland',
      needs: 'Conversation, Light activities',
      status: 'confirmed',
      phoneNumber: '+1 (555) 234-5678',
      email: 'robert.chen@email.com',
      careReceiverDetails: {
        age: 82,
        gender: 'Male',
        address: '456 Maple Avenue, Portland, OR 97201',
        emergencyContact: {
          name: 'David Chen',
          relation: 'Son',
          phone: '+1 (555) 876-5432',
        },
        medicalHistory: [
          'Mild Dementia',
          'Heart Disease',
        ],
        biography: 'Robert enjoys playing chess and sharing stories from his career as an engineer. He benefits from regular social interaction.',
      },
    },
  ];

  const completedBookings: Booking[] = [
    {
      id: 3,
      careReceiverName: 'Margaret Wilson',
      careReceiverImage: 'https://i.pravatar.cc/150?img=5',
      serviceType: 'Personal Care',
      date: new Date(2024, 2, 10),
      startTime: '08:00 AM',
      endTime: '12:00 PM',
      location: '789 Pine Road, Seattle',
      needs: 'Bathing assistance, Dressing',
      status: 'completed',
      phoneNumber: '+1 (555) 345-6789',
      email: 'margaret.w@email.com',
      careReceiverDetails: {
        age: 75,
        gender: 'Female',
        address: '789 Pine Road, Seattle, WA 98101',
        emergencyContact: {
          name: 'Jennifer Wilson',
          relation: 'Daughter',
          phone: '+1 (555) 765-4321',
        },
        medicalHistory: [
          'Arthritis',
          'Limited Mobility',
        ],
        biography: 'Margaret is a warm and friendly person who enjoys knitting and watching classic films.',
      },
    },
  ];

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setLoadingRequests(true);
    // Simulate API call
    setTimeout(() => {
      const mockPendingRequests: PendingRequest[] = [
        {
          id: 101,
          careReceiverName: 'Alice Thompson',
          careReceiverImage: 'https://i.pravatar.cc/150?img=20',
          serviceType: 'Medical Care',
          requestedDate: new Date(2024, 2, 20),
          startTime: '09:00 AM',
          endTime: '01:00 PM',
          location: '321 Birch Lane, Boston',
          specialNeeds: 'Experience with diabetes care required',
          hourlyRate: 35,
          requestDate: '2 hours ago',
        },
        {
          id: 102,
          careReceiverName: 'George Patterson',
          careReceiverImage: 'https://i.pravatar.cc/150?img=15',
          serviceType: 'Companionship',
          requestedDate: new Date(2024, 2, 22),
          startTime: '02:00 PM',
          endTime: '06:00 PM',
          location: '654 Cedar Street, Austin',
          hourlyRate: 25,
          requestDate: '5 hours ago',
        },
      ];
      setPendingRequests(mockPendingRequests);
      setLoadingRequests(false);
    }, 1000);
  };

  const handleApproveRequest = (request: PendingRequest) => {
    Alert.alert(
      'Approve Request',
      `Accept booking request from ${request.careReceiverName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Approve',
          onPress: () => {
            setPendingRequests(prev => prev.filter(r => r.id !== request.id));
            Alert.alert('Success', 'Booking request approved!');
          },
        },
      ]
    );
  };

  const handleRejectRequest = (request: PendingRequest) => {
    setSelectedRequest(request);
    setRejectionModalVisible(true);
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    
    if (selectedRequest) {
      setPendingRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setRejectionModalVisible(false);
      setRejectionReason('');
      setSelectedRequest(null);
      Alert.alert('Request Rejected', 'The client has been notified.');
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const hasBooking = upcomingBookings.some(
        b => b.date.toDateString() === date.toDateString()
      );
      
      days.push(
        <View key={day} style={styles.calendarDay}>
          <View style={[
            styles.calendarDayContent,
            isToday && styles.calendarDayToday,
            hasBooking && styles.calendarDayBooked,
          ]}>
            <Text style={[
              styles.calendarDayText,
              isToday && styles.calendarDayTextToday,
              hasBooking && styles.calendarDayTextBooked,
            ]}>
              {day}
            </Text>
            {hasBooking && <View style={styles.bookingDot} />}
          </View>
        </View>
      );
    }
    
    return days;
  };

  const renderBookingCard = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.dateBox}>
          <Text style={styles.dateMonth}>
            {booking.date.toLocaleDateString('default', {month: 'short'}).toUpperCase()}
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
            <View style={[styles.statusBadge, styles.confirmedBadge]}>
              <Text style={[styles.statusText, styles.confirmedText]}>
                {booking.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Icon name="map-pin" size={14} color="#6b7280" />
        <Text style={styles.locationText}>{booking.location}</Text>
      </View>

      {booking.needs && (
        <View style={styles.needsBox}>
          <Icon name="alert-circle" size={16} color="#f59e0b" />
          <Text style={styles.needsText}>{booking.needs}</Text>
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedContactBooking(booking);
            setCallModalVisible(true);
          }}>
          <Icon name="phone" size={16} color="#8b5cf6" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedContactBooking(booking);
            setMessageModalVisible(true);
          }}>
          <Icon name="mail" size={16} color="#8b5cf6" />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setSelectedBooking(booking)}>
          <Icon name="user" size={16} color="#8b5cf6" />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCompletedBookingsTable = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={true}
      style={styles.tableWrapper}>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.tableDateColumn]}>Date</Text>
          <Text style={[styles.tableHeaderText, styles.tableClientColumn]}>Client</Text>
          <Text style={[styles.tableHeaderText, styles.tableServiceColumn]}>Service</Text>
          <Text style={[styles.tableHeaderText, styles.tableTimeColumn]}>Time</Text>
          <Text style={[styles.tableHeaderText, styles.tableActionColumn]}>Action</Text>
        </View>
        {completedBookings.map(booking => (
          <View key={booking.id} style={styles.tableRow}>
            <View style={styles.tableDateColumn}>
              <Text style={styles.tableDateText}>
                {booking.date.toLocaleDateString('default', {month: 'short', day: 'numeric'})}
              </Text>
              <Text style={styles.tableYearText}>{booking.date.getFullYear()}</Text>
            </View>
            <View style={styles.tableClientColumn}>
              <View style={styles.tableClientContent}>
                <Image source={{uri: booking.careReceiverImage}} style={styles.tableAvatar} />
                <Text style={styles.tableClientText} numberOfLines={1}>
                  {booking.careReceiverName}
                </Text>
              </View>
            </View>
            <View style={styles.tableServiceColumn}>
              <Text style={styles.tableServiceText}>{booking.serviceType}</Text>
            </View>
            <View style={styles.tableTimeColumn}>
              <View style={styles.tableTimeContent}>
                <Icon name="clock" size={12} color="#6b7280" />
                <Text style={styles.tableTimeText}>
                  {booking.startTime}
                </Text>
              </View>
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
  );

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

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

      <ScrollView 
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Calendar Section */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
              <Icon name="chevron-left" size={20} color="#8b5cf6" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>
              {currentDate.toLocaleDateString('default', {month: 'long', year: 'numeric'})}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
              <Icon name="chevron-right" size={20} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarWeekDays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {renderCalendar()}
          </View>
          
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#8b5cf6'}]} />
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
                        source={{uri: request.careReceiverImage}}
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
                          {request.requestedDate.toLocaleDateString('default', {month: 'short', day: 'numeric'})}
                        </Text>
                      </View>
                      <View style={styles.pendingDetailRow}>
                        <Icon name="clock" size={14} color="#6b7280" />
                        <Text style={styles.pendingDetailText}>
                          {request.startTime} - {request.endTime}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

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

        {/* Bookings List Content */}
        <View style={styles.bookingsListContainer}>
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
        </View>
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
                      source={{uri: selectedBooking.careReceiverImage}}
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
                    source={{uri: selectedContactBooking.careReceiverImage}}
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
                    source={{uri: selectedContactBooking.careReceiverImage}}
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
                    style={[styles.primaryActionButton, {backgroundColor: '#10b981', marginTop: 12}]}
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
                      Booking on {selectedContactBooking.date.toLocaleDateString('default', {month: 'short', day: 'numeric'})} at {selectedContactBooking.startTime}
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
                    source={{uri: selectedRequest.careReceiverImage}}
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
                      source={{uri: selectedPendingRequest.careReceiverImage}}
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
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 150,
  },
  bookingsListContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  confirmedText: {
    color: '#10b981',
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
});

export default CaregiverBookingsScreen;
