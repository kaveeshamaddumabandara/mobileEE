import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CareReceiverTabParamList} from '../../navigation/types';
import ApiService from '../../services/api';
import {Caregiver, CareReceiver} from '../../types';
import SideMenu from '../../components/SideMenu';
import DateTimePicker from '@react-native-community/datetimepicker';

type CareReceiverBookingsScreenNavigationProp = NativeStackNavigationProp<
  CareReceiverTabParamList,
  'Bookings'
>;

const CareReceiverBookingsScreen: React.FC = () => {
  const navigation = useNavigation<CareReceiverBookingsScreenNavigationProp>();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState<Caregiver[]>([]);
  const [recommendedCaregivers, setRecommendedCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [careReceiverProfile, setCareReceiverProfile] = useState<CareReceiver | null>(null);
  const [requirementsVisible, setRequirementsVisible] = useState(true);
  
  // User-entered care requirements
  const [medicalConditions, setMedicalConditions] = useState('');
  const [careNeeds, setCareNeeds] = useState('');
  
  // Booking form states
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingTime, setBookingTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [serviceType, setServiceType] = useState('General Care');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCaregivers();
  }, [searchQuery, selectedFilter, caregivers]);

  const loadData = async () => {
    await Promise.all([loadCaregivers(), loadProfile()]);
  };

  const loadProfile = async () => {
    try {
      const data = (await ApiService.getProfile()) as CareReceiver;
      setCareReceiverProfile(data);
      setBookingLocation(data.address || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadCaregivers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCaregivers();
      const availableCaregivers = data.filter(c => c.availability === true);
      setCaregivers(availableCaregivers);
    } catch (error) {
      console.error('Error loading caregivers:', error);
      Alert.alert('Error', 'Failed to load caregivers');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedCaregivers = (): Caregiver[] => {
    if (!medicalConditions.trim() && !careNeeds.trim()) {
      return [];
    }

    const requirements = careNeeds.toLowerCase();
    const conditions = medicalConditions
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    const scored = caregivers.map(caregiver => {
      let score = 0;
      
      // Match specializations
      caregiver.specialization?.forEach(spec => {
        const specLower = spec.toLowerCase();
        if (requirements.includes(specLower)) score += 3;
        conditions.forEach(condition => {
          if (specLower.includes(condition.toLowerCase()) || 
              condition.toLowerCase().includes(specLower)) {
            score += 2;
          }
        });
      });
      
      // Match skills
      caregiver.skills?.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (requirements.includes(skillLower)) score += 2;
        conditions.forEach(condition => {
          if (skillLower.includes(condition.toLowerCase())) {
            score += 1;
          }
        });
      });
      
      // Bonus for high rating and experience
      if ((caregiver.rating || 0) >= 4.5) score += 2;
      if ((caregiver.experience || 0) >= 5) score += 1;
      
      return { caregiver, score };
    });
    
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.caregiver);
  };

  const handleFindCaregivers = () => {
    if (!medicalConditions.trim() && !careNeeds.trim()) {
      Alert.alert('Requirements Needed', 'Please enter your medical conditions or care needs to get personalized recommendations.');
      return;
    }
    const recommended = getRecommendedCaregivers();
    setRecommendedCaregivers(recommended);
    if (recommended.length === 0) {
      Alert.alert('No Matches', 'No caregivers match your specific requirements, but you can browse all available caregivers below.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBookNow = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setBookingModalVisible(true);
  };

  const handleSubmitBooking = () => {
    if (!bookingLocation.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    const bookingData = {
      caregiverId: selectedCaregiver?._id,
      caregiverName: selectedCaregiver?.name,
      date: bookingDate.toISOString(),
      time: bookingTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      location: bookingLocation,
      serviceType: serviceType,
      notes: bookingNotes,
      hourlyRate: selectedCaregiver?.hourlyRate,
    };

    console.log('Booking Data:', bookingData);
    
    Alert.alert(
      'Booking Request',
      `Do you want to book ${selectedCaregiver?.name} for ${serviceType} on ${bookingDate.toLocaleDateString()} at ${bookingTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setBookingModalVisible(false);
            Alert.alert('Success', 'Booking request submitted successfully!');
            resetBookingForm();
          },
        },
      ]
    );
  };

  const resetBookingForm = () => {
    setSelectedCaregiver(null);
    setBookingDate(new Date());
    setBookingTime(new Date());
    setBookingLocation(careReceiverProfile?.address || '');
    setBookingNotes('');
    setServiceType('General Care');
  };

  const filterCaregivers = () => {
    let filtered = [...caregivers];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        caregiver =>
          caregiver.name?.toLowerCase().includes(query) ||
          caregiver.qualification?.toLowerCase().includes(query) ||
          caregiver.specialization?.some(s => s.toLowerCase().includes(query)) ||
          caregiver.skills?.some(s => s.toLowerCase().includes(query)),
      );
    }

    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'highRating':
          filtered = filtered.filter(c => (c.rating || 0) >= 4.0);
          break;
        case 'experienced':
          filtered = filtered.filter(c => (c.experience || 0) >= 5);
          break;
        case 'affordable':
          filtered = filtered.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
          break;
        case 'hasTransport':
          filtered = filtered.filter(c => c.hasTransportation === true);
          break;
      }
    }

    setFilteredCaregivers(filtered);
  };

  const renderCaregiverCard = (caregiver: Caregiver) => {
    return (
      <View key={caregiver._id} style={styles.caregiverCard}>
        <View style={styles.caregiverHeader}>
          <View style={styles.caregiverAvatarContainer}>
            {caregiver.profileImage ? (
              <Image
                source={{uri: caregiver.profileImage}}
                style={styles.caregiverAvatar}
              />
            ) : (
              <View style={styles.caregiverAvatarPlaceholder}>
                <Text style={styles.caregiverAvatarText}>
                  {caregiver.name?.charAt(0).toUpperCase() || 'C'}
                </Text>
              </View>
            )}
            {caregiver.availability && (
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />
              </View>
            )}
          </View>

          <View style={styles.caregiverInfo}>
            <Text style={styles.caregiverName}>{caregiver.name}</Text>
            <Text style={styles.caregiverQualification}>
              {caregiver.qualification || 'Certified Caregiver'}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingText}>
                {caregiver.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.experienceText}>
                • {caregiver.experience || 0} years exp
              </Text>
            </View>
          </View>

          <View style={styles.rateContainer}>
            <Text style={styles.rateAmount}>
              Rs.{caregiver.hourlyRate || 'N/A'}
            </Text>
            <Text style={styles.rateLabel}>/hour</Text>
          </View>
        </View>

        {caregiver.specialization && caregiver.specialization.length > 0 && (
          <View style={styles.specializationContainer}>
            <Icon name="award" size={14} color="#2563eb" />
            <View style={styles.specializationList}>
              {caregiver.specialization.slice(0, 3).map((spec, index) => (
                <View key={index} style={styles.specializationChip}>
                  <Text style={styles.specializationText}>{spec}</Text>
                </View>
              ))}
              {caregiver.specialization.length > 3 && (
                <Text style={styles.moreText}>
                  +{caregiver.specialization.length - 3} more
                </Text>
              )}
            </View>
          </View>
        )}

        {caregiver.skills && caregiver.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            <Icon name="check-circle" size={14} color="#10b981" />
            <View style={styles.skillsList}>
              {caregiver.skills.slice(0, 4).map((skill, index) => (
                <Text key={index} style={styles.skillText}>
                  {skill}
                  {index < Math.min(caregiver.skills!.length - 1, 3) && ', '}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.additionalInfo}>
          {caregiver.languages && caregiver.languages.length > 0 && (
            <View style={styles.infoItem}>
              <Icon name="message-circle" size={12} color="#6b7280" />
              <Text style={styles.infoText}>
                {caregiver.languages.join(', ')}
              </Text>
            </View>
          )}
          {caregiver.hasTransportation && (
            <View style={styles.infoItem}>
              <Icon name="truck" size={12} color="#6b7280" />
              <Text style={styles.infoText}>Has Transportation</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.viewProfileButton}>
            <Icon name="user" size={16} color="#2563eb" />
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => handleBookNow(caregiver)}>
            <Icon name="calendar" size={16} color="#fff" />
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading caregivers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Caregivers</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
          />
        }>

        <View style={styles.requirementsCard}>
          <View style={styles.requirementsHeader}>
            <Icon name="clipboard" size={18} color="#2563eb" />
            <Text style={styles.requirementsTitle}>Enter Your Care Requirements</Text>
            <TouchableOpacity onPress={() => setRequirementsVisible(!requirementsVisible)}>
              <Icon 
                name={requirementsVisible ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#2563eb" 
              />
            </TouchableOpacity>
          </View>
          
          {requirementsVisible && (
            <View style={styles.requirementsContent}>
              <View style={styles.requirementItem}>
                <Text style={styles.requirementLabel}>Medical Conditions:</Text>
                <Text style={styles.requirementHint}>
                  Separate multiple conditions with commas (e.g., Diabetes, Alzheimer's, Mobility Issues)
                </Text>
                <TextInput
                  style={styles.requirementInput}
                  value={medicalConditions}
                  onChangeText={setMedicalConditions}
                  placeholder="Enter medical conditions..."
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </View>
              
              <View style={styles.requirementItem}>
                <Text style={styles.requirementLabel}>Care Needs & Preferences:</Text>
                <Text style={styles.requirementHint}>
                  Describe the type of care needed (e.g., medication management, personal care, companionship)
                </Text>
                <TextInput
                  style={[styles.requirementInput, styles.careNeedsInput]}
                  value={careNeeds}
                  onChangeText={setCareNeeds}
                  placeholder="Describe care needs and preferences..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.findButton}
                onPress={handleFindCaregivers}>
                <Icon name="search" size={18} color="#fff" />
                <Text style={styles.findButtonText}>Find Matching Caregivers</Text>
              </TouchableOpacity>
              
              {recommendedCaregivers.length > 0 && (
                <View style={styles.matchIndicator}>
                  <Icon name="check-circle" size={16} color="#10b981" />
                  <Text style={styles.matchText}>
                    {recommendedCaregivers.length} recommended caregiver{recommendedCaregivers.length !== 1 ? 's' : ''} match your needs
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {recommendedCaregivers.length > 0 && (
          <View style={styles.recommendedSection}>
            <View style={styles.sectionHeader}>
              <Icon name="star" size={20} color="#fbbf24" />
              <Text style={styles.sectionTitle}>Recommended for You</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.recommendedScroll}>
              {recommendedCaregivers.map(caregiver => (
                <View key={caregiver._id} style={styles.recommendedCard}>
                  <View style={styles.recommendedAvatarContainer}>
                    {caregiver.profileImage ? (
                      <Image source={{uri: caregiver.profileImage}} style={styles.recommendedAvatar} />
                    ) : (
                      <View style={styles.recommendedAvatarPlaceholder}>
                        <Text style={styles.recommendedAvatarText}>
                          {caregiver.name?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.recommendedBadge}>
                      <Icon name="award" size={12} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.recommendedName} numberOfLines={1}>
                    {caregiver.name}
                  </Text>
                  <View style={styles.recommendedRating}>
                    <Icon name="star" size={12} color="#fbbf24" />
                    <Text style={styles.recommendedRatingText}>
                      {caregiver.rating?.toFixed(1) || 'N/A'}
                    </Text>
                  </View>
                  <Text style={styles.recommendedRate}>
                    Rs.{caregiver.hourlyRate}/hr
                  </Text>
                  <TouchableOpacity 
                    style={styles.recommendedBookButton}
                    onPress={() => handleBookNow(caregiver)}>
                    <Text style={styles.recommendedBookText}>Book</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, qualification, skills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterToggleButton}
            onPress={() => setShowFilters(!showFilters)}>
            <Icon name="filter" size={16} color="#2563eb" />
            <Text style={styles.filterToggleText}>Filters</Text>
            <Icon
              name={showFilters ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#2563eb"
            />
          </TouchableOpacity>

          {showFilters && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter('all')}>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'all' && styles.filterChipTextActive,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === 'highRating' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter('highRating')}>
                <Icon name="star" size={14} color={selectedFilter === 'highRating' ? '#fff' : '#2563eb'} />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'highRating' && styles.filterChipTextActive,
                  ]}>
                  High Rated
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === 'experienced' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter('experienced')}>
                <Icon name="award" size={14} color={selectedFilter === 'experienced' ? '#fff' : '#2563eb'} />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'experienced' && styles.filterChipTextActive,
                  ]}>
                  Experienced
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === 'affordable' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter('affordable')}>
                <Icon name="dollar-sign" size={14} color={selectedFilter === 'affordable' ? '#fff' : '#2563eb'} />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'affordable' && styles.filterChipTextActive,
                  ]}>
                  Affordable
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === 'hasTransport' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter('hasTransport')}>
                <Icon name="truck" size={14} color={selectedFilter === 'hasTransport' ? '#fff' : '#2563eb'} />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'hasTransport' && styles.filterChipTextActive,
                  ]}>
                  Has Transport
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredCaregivers.length} caregiver{filteredCaregivers.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        {filteredCaregivers.length > 0 ? (
          filteredCaregivers.map(caregiver => renderCaregiverCard(caregiver))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="users" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No caregivers found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'No available caregivers at the moment'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Caregiver</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Icon name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedCaregiver && (
                <View style={styles.selectedCaregiverInfo}>
                  <View style={styles.selectedCaregiverAvatar}>
                    {selectedCaregiver.profileImage ? (
                      <Image 
                        source={{uri: selectedCaregiver.profileImage}} 
                        style={styles.modalAvatarImage} 
                      />
                    ) : (
                      <View style={styles.modalAvatarPlaceholder}>
                        <Text style={styles.modalAvatarText}>
                          {selectedCaregiver.name?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.selectedCaregiverDetails}>
                    <Text style={styles.selectedCaregiverName}>{selectedCaregiver.name}</Text>
                    <Text style={styles.selectedCaregiverRate}>
                      Rs.{selectedCaregiver.hourlyRate}/hour
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Service Type</Text>
                <View style={styles.serviceTypeContainer}>
                  {['General Care', 'Medical Care', 'Companionship', 'Personal Care'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.serviceTypeChip,
                        serviceType === type && styles.serviceTypeChipActive,
                      ]}
                      onPress={() => setServiceType(type)}>
                      <Text
                        style={[
                          styles.serviceTypeText,
                          serviceType === type && styles.serviceTypeTextActive,
                        ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}>
                  <Icon name="calendar" size={20} color="#2563eb" />
                  <Text style={styles.dateTimeText}>
                    {bookingDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}>
                  <Icon name="clock" size={20} color="#2563eb" />
                  <Text style={styles.dateTimeText}>
                    {bookingTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  value={bookingLocation}
                  onChangeText={setBookingLocation}
                  placeholder="Enter service location"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Notes (Optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.notesInput]}
                  value={bookingNotes}
                  onChangeText={setBookingNotes}
                  placeholder="Any specific requirements or instructions..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setBookingModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleSubmitBooking}>
                <Text style={styles.confirmButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={bookingDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setBookingDate(selectedDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={bookingTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) {
              setBookingTime(selectedTime);
            }
          }}
        />
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  requirementsCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  requirementsContent: {
    marginTop: 12,
    gap: 12,
  },
  requirementItem: {
    gap: 6,
    marginBottom: 16,
  },
  requirementLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  requirementHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  requirementInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 45,
  },
  careNeedsInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
  },
  findButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
  recommendedSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  recommendedScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  recommendedCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  recommendedAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  recommendedAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  recommendedAvatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  recommendedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  recommendedRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  recommendedRate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  recommendedBookButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    width: '100%',
  },
  recommendedBookText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    flex: 1,
  },
  filterScrollView: {
    marginTop: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsContainer: {
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  caregiverCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  caregiverHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  caregiverAvatarContainer: {
    position: 'relative',
  },
  caregiverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  caregiverAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caregiverAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  availableBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  caregiverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  caregiverName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  caregiverQualification: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  experienceText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  rateLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  specializationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  specializationList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specializationChip: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specializationText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  skillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  skillsList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillText: {
    fontSize: 13,
    color: '#4b5563',
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  viewProfileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    backgroundColor: '#fff',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
  },
  selectedCaregiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedCaregiverAvatar: {
    marginRight: 12,
  },
  modalAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modalAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  selectedCaregiverDetails: {
    flex: 1,
  },
  selectedCaregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  selectedCaregiverRate: {
    fontSize: 14,
    color: '#6b7280',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceTypeChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  serviceTypeTextActive: {
    color: '#fff',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
  },
  dateTimeText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default CareReceiverBookingsScreen;
