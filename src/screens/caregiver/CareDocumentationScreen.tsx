import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CaregiverTabParamList} from '../../navigation/types';
import SideMenu from '../../components/SideMenu';
import api from '../../services/api';

type CareDocumentationNavigationProp = NativeStackNavigationProp<
  CaregiverTabParamList,
  'CareDocumentation'
>;

interface Booking {
  _id: string;
  careReceiverName: string;
  serviceType: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed';
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

// TODO: Consider using this interface for typed documentation state
// interface CareDocumentation {
//   bookingId: string;
//   servicesProvided: string[];
//   vitalSigns: {
//     bloodPressure: string;
//     temperature: string;
//     heartRate: string;
//     oxygenLevel: string;
//   };
//   medicationAdministered: string[];
//   mealsProvided: string[];
//   activitiesPerformed: string[];
//   behavioralObservations: string;
//   incidents: string;
//   notes: string;
//   timestamp: Date;
// }

const CareDocumentationScreen: React.FC = () => {
  const navigation = useNavigation<CareDocumentationNavigationProp>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'documentation' | 'todo'>('list');
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Documentation form state
  const [servicesProvided, setServicesProvided] = useState<string[]>([]);
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [oxygenLevel, setOxygenLevel] = useState('');
  const [medicationAdministered, setMedicationAdministered] = useState<string[]>([]);
  const [mealsProvided, setMealsProvided] = useState<string[]>([]);
  const [activitiesPerformed, setActivitiesPerformed] = useState<string[]>([]);
  const [behavioralObservations, setBehavioralObservations] = useState('');
  const [incidents, setIncidents] = useState('');
  const [notes, setNotes] = useState('');

  // Todo list state
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const apiBookings = await api.getCaregiverBookings();
      
      // Transform API data to match component format
      const transformedBookings = apiBookings.map((booking: any) => ({
        _id: booking._id,
        careReceiverName: booking.careReceiverId?.name || 'Unknown',
        serviceType: booking.serviceType,
        date: new Date(booking.date),
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      }));
      
      setBookings(transformedBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    setActiveView('documentation');
    // Load existing documentation if available
    loadDocumentation(booking._id);
    loadTodoList(booking._id);
  };

  const loadDocumentation = async (bookingId: string) => {
    try {
      const documentation = await api.getDocumentationByBooking(bookingId);
      
      // Populate form with existing documentation
      if (documentation) {
        setServicesProvided(documentation.servicesProvided || []);
        setBloodPressure(documentation.vitalSigns?.bloodPressure || '');
        setTemperature(documentation.vitalSigns?.temperature || '');
        setHeartRate(documentation.vitalSigns?.heartRate || '');
        setOxygenLevel(documentation.vitalSigns?.oxygenLevel || '');
        setMedicationAdministered(documentation.medicationAdministered || []);
        setMealsProvided(documentation.mealsProvided || []);
        setActivitiesPerformed(documentation.activitiesPerformed || []);
        setBehavioralObservations(documentation.behavioralObservations || '');
        setIncidents(documentation.incidents || '');
        setNotes(documentation.notes || '');
      } else {
        // Reset form if no documentation exists
        resetForm();
      }
    } catch (error: any) {
      // If no documentation exists (404), just reset the form
      if (error.response?.status === 404) {
        resetForm();
      } else {
        console.error('Error loading documentation:', error);
      }
    }
  };

  const resetForm = () => {
    setServicesProvided([]);
    setBloodPressure('');
    setTemperature('');
    setHeartRate('');
    setOxygenLevel('');
    setMedicationAdministered([]);
    setMealsProvided([]);
    setActivitiesPerformed([]);
    setBehavioralObservations('');
    setIncidents('');
    setNotes('');
  };

  const loadTodoList = async (bookingId: string) => {
    try {
      const todos = await api.getTodoList(bookingId);
      
      // Transform API data to component format
      const transformedTodos = todos.map((todo: any) => ({
        id: todo._id,
        text: todo.text,
        completed: todo.completed,
        priority: todo.priority,
      }));
      
      setTodoItems(transformedTodos);
    } catch (error: any) {
      console.error('Error loading todo list:', error);
      setTodoItems([]);
    }
  };

  const handleSaveDocumentation = async () => {
    if (!selectedBooking) return;

    try {
      setSaving(true);
      
      const documentationData = {
        servicesProvided,
        vitalSigns: {
          bloodPressure,
          temperature,
          heartRate,
          oxygenLevel,
        },
        medicationAdministered,
        mealsProvided,
        activitiesPerformed,
        behavioralObservations,
        incidents,
        notes,
      };

      await api.createOrUpdateDocumentation(
        selectedBooking._id,
        documentationData,
      );
      
      Alert.alert('Success', 'Care documentation saved successfully!');
    } catch (error: any) {
      console.error('Error saving documentation:', error);
      Alert.alert('Error', 'Failed to save documentation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (service: string) => {
    if (servicesProvided.includes(service)) {
      setServicesProvided(servicesProvided.filter(s => s !== service));
    } else {
      setServicesProvided([...servicesProvided, service]);
    }
  };

  const addMedication = () => {
    Alert.prompt(
      'Add Medication',
      'Enter medication name and dosage',
      (text: string) => {
        if (text.trim()) {
          setMedicationAdministered([...medicationAdministered, text.trim()]);
        }
      },
    );
  };

  const addMeal = () => {
    Alert.prompt(
      'Add Meal',
      'Enter meal description',
      (text: string) => {
        if (text.trim()) {
          setMealsProvided([...mealsProvided, text.trim()]);
        }
      },
    );
  };

  const addActivity = () => {
    Alert.prompt(
      'Add Activity',
      'Enter activity description',
      (text: string) => {
        if (text.trim()) {
          setActivitiesPerformed([...activitiesPerformed, text.trim()]);
        }
      },
    );
  };

  const removeMedication = (index: number) => {
    const updated = medicationAdministered.filter((_, i) => i !== index);
    setMedicationAdministered(updated);
  };

  const removeMeal = (index: number) => {
    const updated = mealsProvided.filter((_, i) => i !== index);
    setMealsProvided(updated);
  };

  const removeActivity = (index: number) => {
    const updated = activitiesPerformed.filter((_, i) => i !== index);
    setActivitiesPerformed(updated);
  };

  const handleAddTodo = async () => {
    if (!newTodoText.trim() || !selectedBooking) return;

    try {
      await api.addTodoItem(selectedBooking._id, {
        text: newTodoText.trim(),
        priority: newTodoPriority,
      });

      // Reload todo list
      await loadTodoList(selectedBooking._id);
      
      setNewTodoText('');
      setNewTodoPriority('medium');
      setTodoModalVisible(false);
    } catch (error: any) {
      console.error('Error adding todo:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  const toggleTodoComplete = async (id: string) => {
    if (!selectedBooking) return;

    try {
      const todo = todoItems.find(item => item.id === id);
      if (!todo) return;

      await api.updateTodoItem(selectedBooking._id, id, {
        completed: !todo.completed,
      });

      // Update local state
      setTodoItems(
        todoItems.map(item =>
          item.id === id ? {...item, completed: !item.completed} : item,
        ),
      );
    } catch (error: any) {
      console.error('Error updating todo:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const deleteTodo = async (id: string) => {
    if (!selectedBooking) return;

    try {
      await api.deleteTodoItem(selectedBooking._id, id);

      // Update local state
      setTodoItems(todoItems.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting todo:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const renderBookingsList = () => (
    <ScrollView style={styles.scrollView}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : (
        <View style={styles.bookingsContainer}>
          <Text style={styles.sectionTitle}>Select a Booking to Document</Text>
          {bookings.length > 0 ? (
            bookings.map(booking => (
              <TouchableOpacity
                key={booking._id}
                style={styles.bookingCard}
                onPress={() => handleBookingSelect(booking)}>
                <View style={styles.bookingCardHeader}>
                  <View>
                    <Text style={styles.bookingCardName}>{booking.careReceiverName}</Text>
                    <Text style={styles.bookingCardService}>{booking.serviceType}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      booking.status === 'confirmed'
                        ? styles.confirmedBadge
                        : booking.status === 'completed'
                        ? styles.completedBadge
                        : styles.pendingBadge,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        booking.status === 'confirmed'
                          ? styles.confirmedText
                          : booking.status === 'completed'
                          ? styles.completedText
                          : styles.pendingText,
                      ]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.bookingCardDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="calendar" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>
                      {booking.date.toLocaleDateString('default', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="clock" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>
                      {booking.startTime} - {booking.endTime}
                    </Text>
                  </View>
                </View>
                <View style={styles.bookingCardFooter}>
                  <Icon name="file-text" size={16} color="#8b5cf6" />
                  <Text style={styles.bookingCardFooterText}>Tap to document</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>No Bookings Found</Text>
              <Text style={styles.emptyStateText}>
                You don't have any bookings to document yet
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderDocumentationForm = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.formContainer}>
        {/* Header with booking info */}
        <View style={styles.documentHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveView('list');
              setSelectedBooking(null);
            }}>
            <Icon name="arrow-left" size={20} color="#8b5cf6" />
            <Text style={styles.backButtonText}>Back to Bookings</Text>
          </TouchableOpacity>
          <Text style={styles.documentTitle}>{selectedBooking?.careReceiverName}</Text>
          <Text style={styles.documentSubtitle}>{selectedBooking?.serviceType}</Text>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeView === 'documentation' && styles.activeToggleButton,
            ]}
            onPress={() => setActiveView('documentation')}>
            <Icon
              name="file-text"
              size={18}
              color={activeView === 'documentation' ? '#fff' : '#8b5cf6'}
            />
            <Text
              style={[
                styles.toggleButtonText,
                activeView === 'documentation' && styles.activeToggleButtonText,
              ]}>
              Documentation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeView === 'todo' && styles.activeToggleButton,
            ]}
            onPress={() => setActiveView('todo')}>
            <Icon
              name="check-square"
              size={18}
              color={activeView === 'todo' ? '#fff' : '#8b5cf6'}
            />
            <Text
              style={[
                styles.toggleButtonText,
                activeView === 'todo' && styles.activeToggleButtonText,
              ]}>
              To-Do List
            </Text>
          </TouchableOpacity>
        </View>

        {activeView === 'documentation' ? (
          <>
            {/* Services Provided */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Services Provided</Text>
              <View style={styles.checkboxGroup}>
                {[
                  'Medication Administration',
                  'Vital Signs Monitoring',
                  'Personal Hygiene',
                  'Meal Preparation',
                  'Mobility Assistance',
                  'Companionship',
                  'Physical Therapy',
                  'Wound Care',
                ].map(service => (
                  <TouchableOpacity
                    key={service}
                    style={styles.checkboxItem}
                    onPress={() => toggleService(service)}>
                    <View
                      style={[
                        styles.checkbox,
                        servicesProvided.includes(service) && styles.checkboxChecked,
                      ]}>
                      {servicesProvided.includes(service) && (
                        <Icon name="check" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{service}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Vital Signs */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Vital Signs</Text>
              <View style={styles.vitalSignsGrid}>
                <View style={styles.vitalSignInput}>
                  <Text style={styles.inputLabel}>Blood Pressure</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="120/80"
                    value={bloodPressure}
                    onChangeText={setBloodPressure}
                  />
                </View>
                <View style={styles.vitalSignInput}>
                  <Text style={styles.inputLabel}>Temperature (°F)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="98.6"
                    keyboardType="decimal-pad"
                    value={temperature}
                    onChangeText={setTemperature}
                  />
                </View>
                <View style={styles.vitalSignInput}>
                  <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="72"
                    keyboardType="number-pad"
                    value={heartRate}
                    onChangeText={setHeartRate}
                  />
                </View>
                <View style={styles.vitalSignInput}>
                  <Text style={styles.inputLabel}>Oxygen Level (%)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="98"
                    keyboardType="number-pad"
                    value={oxygenLevel}
                    onChangeText={setOxygenLevel}
                  />
                </View>
              </View>
            </View>

            {/* Medication Administered */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.formSectionTitle}>Medication Administered</Text>
                <TouchableOpacity style={styles.addButton} onPress={addMedication}>
                  <Icon name="plus" size={16} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
              {medicationAdministered.length > 0 ? (
                medicationAdministered.map((med, index) => (
                  <View key={index} style={styles.listItem}>
                    <Icon name="pill" size={14} color="#8b5cf6" />
                    <Text style={styles.listItemText}>{med}</Text>
                    <TouchableOpacity onPress={() => removeMedication(index)}>
                      <Icon name="x" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No medications added</Text>
              )}
            </View>

            {/* Meals Provided */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.formSectionTitle}>Meals Provided</Text>
                <TouchableOpacity style={styles.addButton} onPress={addMeal}>
                  <Icon name="plus" size={16} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
              {mealsProvided.length > 0 ? (
                mealsProvided.map((meal, index) => (
                  <View key={index} style={styles.listItem}>
                    <Icon name="coffee" size={14} color="#8b5cf6" />
                    <Text style={styles.listItemText}>{meal}</Text>
                    <TouchableOpacity onPress={() => removeMeal(index)}>
                      <Icon name="x" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No meals added</Text>
              )}
            </View>

            {/* Activities Performed */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.formSectionTitle}>Activities Performed</Text>
                <TouchableOpacity style={styles.addButton} onPress={addActivity}>
                  <Icon name="plus" size={16} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
              {activitiesPerformed.length > 0 ? (
                activitiesPerformed.map((activity, index) => (
                  <View key={index} style={styles.listItem}>
                    <Icon name="activity" size={14} color="#8b5cf6" />
                    <Text style={styles.listItemText}>{activity}</Text>
                    <TouchableOpacity onPress={() => removeActivity(index)}>
                      <Icon name="x" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No activities added</Text>
              )}
            </View>

            {/* Behavioral Observations */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Behavioral Observations</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Note any changes in mood, behavior, or cognitive function..."
                multiline
                numberOfLines={4}
                value={behavioralObservations}
                onChangeText={setBehavioralObservations}
                textAlignVertical="top"
              />
            </View>

            {/* Incidents */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Incidents / Concerns</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Report any falls, accidents, or concerning incidents..."
                multiline
                numberOfLines={4}
                value={incidents}
                onChangeText={setIncidents}
                textAlignVertical="top"
              />
            </View>

            {/* Additional Notes */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any other relevant information..."
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveDocumentation}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="save" size={20} color="#fff" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Documentation'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // Todo List View
          <>
            <View style={styles.todoHeader}>
              <Text style={styles.todoTitle}>Service To-Do List</Text>
              <TouchableOpacity
                style={styles.addTodoButton}
                onPress={() => setTodoModalVisible(true)}>
                <Icon name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {todoItems.length > 0 ? (
              <View style={styles.todoList}>
                {todoItems
                  .sort((a, b) => {
                    if (a.completed !== b.completed)
                      return a.completed ? 1 : -1;
                    const priorityOrder = {high: 0, medium: 1, low: 2};
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map(item => (
                    <View key={item.id} style={styles.todoItem}>
                      <TouchableOpacity
                        style={styles.todoCheckbox}
                        onPress={() => toggleTodoComplete(item.id)}>
                        <View
                          style={[
                            styles.checkbox,
                            item.completed && styles.checkboxChecked,
                          ]}>
                          {item.completed && (
                            <Icon name="check" size={14} color="#fff" />
                          )}
                        </View>
                      </TouchableOpacity>
                      <View style={styles.todoContent}>
                        <Text
                          style={[
                            styles.todoText,
                            item.completed && styles.todoTextCompleted,
                          ]}>
                          {item.text}
                        </Text>
                        <View
                          style={[
                            styles.priorityBadge,
                            item.priority === 'high'
                              ? styles.priorityHigh
                              : item.priority === 'medium'
                              ? styles.priorityMedium
                              : styles.priorityLow,
                          ]}>
                          <Text style={styles.priorityText}>{item.priority}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteTodo(item.id)}>
                        <Icon name="trash-2" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="check-square" size={64} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No Tasks Yet</Text>
                <Text style={styles.emptyStateText}>
                  Add tasks to keep track of your service checklist
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
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
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care Documentation</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {activeView === 'list' ? renderBookingsList() : renderDocumentationForm()}

      {/* Add Todo Modal */}
      <Modal
        visible={todoModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTodoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={() => setTodoModalVisible(false)}>
                <Icon name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Task Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter task description..."
                multiline
                numberOfLines={3}
                value={newTodoText}
                onChangeText={setNewTodoText}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      newTodoPriority === priority && styles.priorityOptionSelected,
                      priority === 'high' && newTodoPriority === priority
                        ? styles.priorityHigh
                        : priority === 'medium' && newTodoPriority === priority
                        ? styles.priorityMedium
                        : priority === 'low' && newTodoPriority === priority
                        ? styles.priorityLow
                        : {},
                    ]}
                    onPress={() => setNewTodoPriority(priority)}>
                    <Text
                      style={[
                        styles.priorityOptionText,
                        newTodoPriority === priority &&
                          styles.priorityOptionTextSelected,
                      ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setTodoModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleAddTodo}>
                <Icon name="plus" size={18} color="#fff" />
                <Text style={styles.modalSaveText}>Add Task</Text>
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
    paddingBottom: 100, // Space for floating tab bar
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
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  bookingsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bookingCardService: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confirmedBadge: {
    backgroundColor: '#dbeafe',
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  confirmedText: {
    color: '#1e40af',
  },
  completedText: {
    color: '#065f46',
  },
  pendingText: {
    color: '#92400e',
  },
  bookingCardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
  },
  bookingCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  bookingCardFooterText: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  formContainer: {
    padding: 16,
  },
  documentHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeToggleButton: {
    backgroundColor: '#8b5cf6',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  activeToggleButtonText: {
    color: '#fff',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  vitalSignsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalSignInput: {
    flex: 1,
    minWidth: '45%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addTodoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoList: {
    gap: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  todoCheckbox: {
    marginRight: 4,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityHigh: {
    backgroundColor: '#fee2e2',
  },
  priorityMedium: {
    backgroundColor: '#fef3c7',
  },
  priorityLow: {
    backgroundColor: '#dbeafe',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: 8,
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
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  priorityOptionSelected: {
    borderColor: 'transparent',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  priorityOptionTextSelected: {
    color: '#374151',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalSaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CareDocumentationScreen;
