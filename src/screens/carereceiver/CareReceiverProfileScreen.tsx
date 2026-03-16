import React, {useEffect, useState} from 'react';
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
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CareReceiverTabParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';
import ApiService from '../../services/api';
import {CareReceiver} from '../../types';
import SideMenu from '../../components/SideMenu';

type CareReceiverProfileScreenNavigationProp = NativeStackNavigationProp<
  CareReceiverTabParamList,
  'Profile'
>;

const CareReceiverProfileScreen: React.FC = () => {
  const navigation = useNavigation<CareReceiverProfileScreenNavigationProp>();
  const {user, updateUser, logout} = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Partial<CareReceiver> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [conditionInput, setConditionInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = (await ApiService.getProfile()) as CareReceiver;
      console.log('🔍 Profile data received:', JSON.stringify(data, null, 2));
      console.log('📛 Profile name:', data?.name);
      setProfile(data);
      setProfileImage(data.profileImage || user?.profileImage || null);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleImagePick = async () => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImageSelection('camera'),
        },
        {
          text: 'Choose from Library',
          onPress: () => handleImageSelection('library'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const handleImageSelection = async (source: 'camera' | 'library') => {
    const options = {
      mediaType: 'photo' as const,
      maxWidth: 800,
      maxHeight: 800,
    };

    const callback = async (response: any) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', 'Failed to get image: ' + response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0].uri) {
        const localUri = response.assets[0].uri;
        
        setLoading(true);
        try {
          const uploadResult = await ApiService.uploadImage(localUri);
          
          if (uploadResult.success && uploadResult.data?.url) {
            const imageUrl = uploadResult.data.url;
            setProfileImage(imageUrl);
            Alert.alert('Success', 'Image uploaded! Click Save to update your profile.');
          } else {
            Alert.alert('Error', uploadResult.message || 'Failed to upload image');
          }
        } catch (error: any) {
          console.error('Image upload error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image. Please check your connection.';
          Alert.alert('Upload Error', errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    if (source === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const addCondition = () => {
    if (!isEditing || !profile) return;
    if (conditionInput.trim()) {
      setProfile({
        ...profile,
        medicalConditions: [
          ...(profile.medicalConditions || []),
          conditionInput.trim(),
        ],
      });
      setConditionInput('');
    }
  };

  const removeCondition = (index: number) => {
    if (!isEditing || !profile) return;
    setProfile({
      ...profile,
      medicalConditions: profile.medicalConditions?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const updateData: any = {
        ...profile,
      };

      if (profileImage) {
        if (profileImage.startsWith('http')) {
          updateData.profileImage = profileImage;
        } else {
          Alert.alert('Error', 'Please wait for image upload to complete');
          setLoading(false);
          return;
        }
      }

      const updatedUser = await ApiService.updateCareReceiverProfile(updateData);
      
      if (profileImage) {
        updateUser({...updatedUser, profileImage: profileImage});
      } else {
        updateUser(updatedUser);
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: logout},
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="alert-circle" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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

      {/* Header with Menu */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            <TouchableOpacity 
              style={styles.avatar}
              onPress={isEditing ? handleImagePick : undefined}
              disabled={!isEditing}>
              {profileImage ? (
                <Image source={{uri: profileImage}} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {profile?.name?.charAt(0).toUpperCase() || 'C'}
                </Text>
              )}
              {isEditing && (
                <View style={styles.cameraIconBadge}>
                  <Icon name="camera" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.name || 'Care Receiver'}</Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={toggleEdit}
            disabled={loading}>
            <Icon name={isEditing ? 'save' : 'edit-2'} size={18} color="#2563eb" />
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="user" size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile?.name}
                onChangeText={text => setProfile({...profile, name: text})}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.value}>{profile?.name || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile?.email || 'Not provided'}</Text>
            {isEditing && <Text style={styles.helperText}>Email cannot be changed</Text>}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile?.phone}
                onChangeText={text => setProfile({...profile, phone: text})}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{profile?.phone || 'Not provided'}</Text>
            )}
          </View>

          {profile?.dateOfBirth && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>
                {new Date(profile.dateOfBirth).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Address */}
        {(profile?.address || profile?.city || profile?.district || isEditing) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="map-pin" size={20} color="#2563eb" />
              <Text style={styles.sectionTitle}>Address</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Street Address</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile?.address}
                  onChangeText={text => setProfile({...profile, address: text})}
                  placeholder="Enter street address"
                />
              ) : (
                <Text style={styles.value}>{profile?.address || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>City</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile?.city}
                  onChangeText={text => setProfile({...profile, city: text})}
                  placeholder="Enter city"
                />
              ) : (
                <Text style={styles.value}>{profile?.city || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>District</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile?.district}
                  onChangeText={text => setProfile({...profile, district: text})}
                  placeholder="Enter district"
                />
              ) : (
                <Text style={styles.value}>{profile?.district || 'Not provided'}</Text>
              )}
            </View>
          </View>
        )}

        {/* Medical Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="heart" size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Medical Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Medical Conditions</Text>
            {isEditing && (
              <View style={styles.conditionInputRow}>
                <TextInput
                  style={[styles.input, styles.conditionInput]}
                  value={conditionInput}
                  onChangeText={setConditionInput}
                  placeholder="Add a medical condition"
                />
                <TouchableOpacity style={styles.addButton} onPress={addCondition}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
            {profile?.medicalConditions && profile.medicalConditions.length > 0 ? (
              <View style={styles.conditionsContainer}>
                {profile.medicalConditions.map((condition, index) => (
                  <View key={index} style={styles.conditionChip}>
                    <Text style={styles.conditionText}>{condition}</Text>
                    {isEditing && (
                      <TouchableOpacity onPress={() => removeCondition(index)}>
                        <Text style={styles.removeConditionText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No medical conditions added</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Care Requirements</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile?.careRequirements}
                onChangeText={text => setProfile({...profile, careRequirements: text})}
                placeholder="Describe your care needs"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.valueMultiline}>
                {profile?.careRequirements || 'No care requirements specified'}
              </Text>
            )}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="phone-call" size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Contact Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile?.emergencyContact?.name}
                onChangeText={text => setProfile({
                  ...profile,
                  emergencyContact: {
                    ...profile?.emergencyContact!,
                    name: text,
                  },
                })}
                placeholder="Emergency contact name"
              />
            ) : (
              <Text style={styles.value}>{profile?.emergencyContact?.name || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Contact Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile?.emergencyContact?.phone}
                onChangeText={text => setProfile({
                  ...profile,
                  emergencyContact: {
                    ...profile?.emergencyContact!,
                    phone: text,
                  },
                })}
                placeholder="Emergency contact phone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{profile?.emergencyContact?.phone || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Relationship</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile?.emergencyContact?.relationship}
                onChangeText={text => setProfile({
                  ...profile,
                  emergencyContact: {
                    ...profile?.emergencyContact!,
                    relationship: text,
                  },
                })}
                placeholder="Relationship (e.g., Spouse, Sibling)"
              />
            ) : (
              <Text style={styles.value}>{profile?.emergencyContact?.relationship || 'Not provided'}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingBottom: 100, // Space for floating tab bar
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#bfdbfe',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#2563eb',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  editButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  valueMultiline: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  conditionInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  conditionInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  conditionText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  removeConditionText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default CareReceiverProfileScreen;
