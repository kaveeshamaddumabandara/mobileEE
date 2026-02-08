import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CareReceiverTabParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';
import ApiService from '../../services/api';
import {CareReceiver} from '../../types';

type CareReceiverProfileScreenNavigationProp = NativeStackNavigationProp<
  CareReceiverTabParamList,
  'Profile'
>;

const CareReceiverProfileScreen: React.FC = () => {
  const navigation = useNavigation<CareReceiverProfileScreenNavigationProp>();
  const {user, updateUser, logout} = useAuth();
  const [profile, setProfile] = useState<Partial<CareReceiver>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: 0,
    medicalConditions: [],
    careRequirements: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [conditionInput, setConditionInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = (await ApiService.getProfile()) as CareReceiver;
      setProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        age: data.age,
        medicalConditions: data.medicalConditions || [],
        careRequirements: data.careRequirements,
        emergencyContact: data.emergencyContact || {
          name: '',
          phone: '',
          relationship: '',
        },
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await ApiService.updateCareReceiverProfile(profile);
      updateUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile',
      );
    } finally {
      setLoading(false);
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setProfile(prev => ({
        ...prev,
        medicalConditions: [
          ...(prev.medicalConditions || []),
          conditionInput.trim(),
        ],
      }));
      setConditionInput('');
    }
  };

  const removeCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions:
        prev.medicalConditions?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: logout},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2563eb" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Profile Settings</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={text => setProfile({...profile, name: text})}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile.email}
              editable={false}
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={text => setProfile({...profile, phone: text})}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={profile.age?.toString() || ''}
              onChangeText={text =>
                setProfile({...profile, age: parseInt(text) || 0})
              }
              placeholder="Enter your age"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Medical Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Medical Conditions</Text>
            <View style={styles.conditionInputRow}>
              <TextInput
                style={[styles.input, styles.conditionInput]}
                value={conditionInput}
                onChangeText={setConditionInput}
                placeholder="Add a medical condition"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addCondition}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.conditionsContainer}>
              {profile.medicalConditions?.map((condition, index) => (
                <View key={index} style={styles.conditionChip}>
                  <Text style={styles.conditionText}>{condition}</Text>
                  <TouchableOpacity onPress={() => removeCondition(index)}>
                    <Text style={styles.removeConditionText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Care Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.careRequirements}
              onChangeText={text =>
                setProfile({...profile, careRequirements: text})
              }
              placeholder="Describe your care needs"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Name</Text>
            <TextInput
              style={styles.input}
              value={profile.emergencyContact?.name}
              onChangeText={text =>
                setProfile({
                  ...profile,
                  emergencyContact: {
                    ...profile.emergencyContact!,
                    name: text,
                  },
                })
              }
              placeholder="Emergency contact name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={profile.emergencyContact?.phone}
              onChangeText={text =>
                setProfile({
                  ...profile,
                  emergencyContact: {
                    ...profile.emergencyContact!,
                    phone: text,
                  },
                })
              }
              placeholder="Emergency contact phone"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={profile.emergencyContact?.relationship}
              onChangeText={text =>
                setProfile({
                  ...profile,
                  emergencyContact: {
                    ...profile.emergencyContact!,
                    relationship: text,
                  },
                })
              }
              placeholder="Relationship (e.g., Spouse, Sibling)"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
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
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  conditionText: {
    fontSize: 14,
    color: '#dc2626',
  },
  removeConditionText: {
    fontSize: 20,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CareReceiverProfileScreen;
