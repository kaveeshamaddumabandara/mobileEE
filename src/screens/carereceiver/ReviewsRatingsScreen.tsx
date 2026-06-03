import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import SideMenu from '../../components/SideMenu';
import ApiService from '../../services/api';

const ReviewsRatingsScreen: React.FC<any> = ({navigation}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myReviews, setMyReviews] = useState<any[]>([]);

  const [caregiverName, setCaregiverName] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const loadMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      const reviews = await ApiService.getMyCaregiverReviews();
      setMyReviews(Array.isArray(reviews) ? reviews : []);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyReviews();
  }, [loadMyReviews]);

  const handleSubmitReview = async () => {
    if (!caregiverName.trim()) {
      Alert.alert('Required', 'Please enter caregiver name');
      return;
    }

    if (!review.trim()) {
      Alert.alert('Required', 'Please add your review');
      return;
    }

    try {
      setSubmitting(true);
      await ApiService.submitCaregiverReview({
        caregiverName: caregiverName.trim(),
        rating,
        review: review.trim(),
      });
      Alert.alert('Success', 'Review submitted successfully');
      setCaregiverName('');
      setRating(5);
      setReview('');
      await loadMyReviews();
    } catch (error: any) {
      Alert.alert(
        'Review Failed',
        error?.response?.data?.message || 'Failed to submit review',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ratings & Reviews</Text>
          <Text style={styles.subtitle}>Submit feedback for your caregiver</Text>
        </View>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Caregiver Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter caregiver name"
            value={caregiverName}
            onChangeText={setCaregiverName}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Rate (Stars)</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icon
                  name="star"
                  size={28}
                  color={star <= rating ? '#f59e0b' : '#d1d5db'}
                  style={styles.starButton}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Add Review</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write your review"
            value={review}
            onChangeText={setReview}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitReview}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>My Submitted Reviews</Text>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading reviews...</Text>
          </View>
        ) : myReviews.length === 0 ? (
          <View style={styles.emptyBox}>
            <Icon name="message-square" size={22} color="#9ca3af" />
            <Text style={styles.emptyText}>No reviews submitted yet</Text>
          </View>
        ) : (
          myReviews.map(item => (
            <View style={styles.reviewCard} key={item._id}>
              <Text style={styles.reviewCaregiverName}>
                {item.caregiverId?.name || item.caregiverName || 'Caregiver'}
              </Text>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Icon
                    key={star}
                    name="star"
                    size={14}
                    color={star <= item.rating ? '#f59e0b' : '#d1d5db'}
                  />
                ))}
              </View>
              <Text style={styles.reviewText}>{item.comment || item.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827',
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    marginRight: 8,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  loadingBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
  },
  reviewCaregiverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ReviewsRatingsScreen;
