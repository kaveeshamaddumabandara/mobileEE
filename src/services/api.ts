import axios, {AxiosInstance, AxiosError} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Caregiver,
  CareReceiver,
  Payment,
  Feedback,
  ApiError,
} from '../types';

// Update this to your backend URL
// For iOS Simulator use localhost, for Android Emulator use 10.0.2.2, for physical device use your computer's IP
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    // Add request interceptor to include token
    this.api.interceptors.request.use(
      async config => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Ensure fresh data by adding timestamp to prevent caching
        config.params = {
          ...config.params,
          _t: new Date().getTime(),
        };
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('API Service - Login called with:', credentials);
    console.log('API Base URL:', API_BASE_URL);
    try {
      const response = await this.api.post('/auth/login', credentials);
      console.log('API Service - Login response:', response.data);
      // Backend returns {status, message, data: {user, token}}
      return {
        token: response.data.data.token,
        user: response.data.data.user,
      };
    } catch (error: any) {
      console.error('API Service - Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', data);
    // Backend returns {status, message, data: {user, token}}
    return {
      token: response.data.data.token,
      user: response.data.data.user,
    };
  }

  async forgotPassword(email: string): Promise<{message: string}> {
    const response = await this.api.post('/auth/forgotpassword', {email});
    return response.data;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{message: string}> {
    const response = await this.api.put(`/auth/resetpassword/${token}`, {
      password: newPassword,
    });
    return response.data;
  }

  // Profile endpoints
  async getProfile(): Promise<User> {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    
    if (parsedUser?.role === 'caregiver') {
      const response = await this.api.get('/caregiver/profile');
      // Backend returns {status, data: {caregiver}} where caregiver has populated userId
      const caregiver = response.data.data.caregiver;
      return {
        ...caregiver.userId,
        ...caregiver,
        _id: caregiver.userId._id,
      };
    }
    
    if (parsedUser?.role === 'carereceiver') {
      const response = await this.api.get('/carereceiver/profile');
      console.log('🌐 Backend response:', JSON.stringify(response.data, null, 2));
      // Backend returns {status, data: {careReceiver}} where careReceiver has populated userId
      const careReceiver = response.data.data.careReceiver;
      const userData = careReceiver.userId;
      
      console.log('👤 userData:', JSON.stringify(userData, null, 2));
      console.log('📛 userData.name:', userData?.name);
      
      if (!userData) {
        throw new Error('User data not populated in care receiver profile');
      }
      
      // Merge User data with CareReceiver data
      const mergedData = {
        ...userData,
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        medicalConditions: careReceiver.medicalHistory?.map((m: any) => m.condition).filter(Boolean) || [],
        careRequirements: careReceiver.careNeeds?.join(', ') || '',
        emergencyContact: userData.emergencyContact || careReceiver.emergencyContact,
        // Map address fields from User.address object
        address: userData.address?.street || '',
        city: userData.address?.city || '',
        district: userData.address?.state || '',
        dateOfBirth: userData.dateOfBirth,
      };
      
      console.log('✅ Merged profile data:', JSON.stringify(mergedData, null, 2));
      return mergedData;
    }
    
    const response = await this.api.get<User>('/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.put<User>('/profile/update', data);
    return response.data;
  }

  async uploadProfileImage(imageUri: string): Promise<{imageUrl: string}> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadImage(imageUri: string): Promise<{success: boolean; data?: {url: string; publicId: string}; message?: string}> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `photo_${Date.now()}.jpg`,
    } as any);

    const response = await this.api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Caregiver endpoints
  async getCaregivers(): Promise<Caregiver[]> {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    
    // Care receivers should get available caregivers from their own endpoint
    if (parsedUser?.role === 'carereceiver') {
      const response = await this.api.get('/carereceiver/available-caregivers');
      return response.data.data;
    }
    
    // For other roles (admin, etc.)
    const response = await this.api.get<Caregiver[]>('/caregiver');
    return response.data;
  }

  async getCaregiverById(id: string): Promise<Caregiver> {
    const response = await this.api.get<Caregiver>(`/caregiver/${id}`);
    return response.data;
  }

  async updateCaregiverProfile(data: Partial<Caregiver>): Promise<Caregiver> {
    const response = await this.api.put(
      '/caregiver/profile',
      data,
    );
    // Backend returns {status, message, data: {caregiver}}
    const caregiver = response.data.data.caregiver;
    return {
      ...caregiver.userId,
      ...caregiver,
      _id: caregiver.userId._id,
      role: 'caregiver', // Ensure role is always caregiver
    };
  }

  async toggleAvailability(available: boolean): Promise<{message: string}> {
    const response = await this.api.patch('/caregiver/availability', {
      available,
    });
    return response.data;
  }

  // Caregiver Dashboard endpoints
  async getCaregiverDashboardStats(): Promise<any> {
    const response = await this.api.get('/caregiver/dashboard/stats');
    return response.data.data;
  }

  async getCaregiverPerformance(): Promise<any> {
    const response = await this.api.get('/caregiver/dashboard/performance');
    return response.data.data;
  }

  async getCaregiverClientSatisfaction(): Promise<any> {
    const response = await this.api.get('/caregiver/dashboard/satisfaction');
    return response.data.data;
  }

  async getCaregiverFeedback(): Promise<any[]> {
    const response = await this.api.get('/caregiver/dashboard/feedback');
    return response.data.data;
  }

  // Care Receiver endpoints
  async getCareReceivers(): Promise<CareReceiver[]> {
    const response = await this.api.get<CareReceiver[]>('/carereceiver');
    return response.data;
  }

  async getCareReceiverById(id: string): Promise<CareReceiver> {
    const response = await this.api.get<CareReceiver>(`/carereceiver/${id}`);
    return response.data;
  }

  async updateCareReceiverProfile(
    data: Partial<CareReceiver>,
  ): Promise<CareReceiver> {
    const response = await this.api.put<CareReceiver>(
      '/carereceiver/profile',
      data,
    );
    return response.data;
  }

  async requestCaregiver(caregiverId: string): Promise<{message: string}> {
    const response = await this.api.post('/carereceiver/request', {
      caregiverId,
    });
    return response.data;
  }

  // Payment endpoints
  async getPayments(): Promise<Payment[]> {
    const response = await this.api.get<Payment[]>('/payment');
    return response.data;
  }

  async createPayment(data: {
    amount: number;
    caregiverId?: string;
    careReceiverId?: string;
  }): Promise<Payment> {
    const response = await this.api.post<Payment>('/payment', data);
    return response.data;
  }

  // Feedback endpoints
  async getFeedback(): Promise<Feedback[]> {
    const response = await this.api.get<Feedback[]>('/feedback');
    return response.data;
  }

  async submitFeedback(data: {
    rating: number;
    comment: string;
  }): Promise<Feedback> {
    const response = await this.api.post<Feedback>('/feedback', data);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<any> {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  // Care Receiver Dashboard
  async getCareReceiverDashboard(): Promise<any> {
    const response = await this.api.get('/carereceiver/dashboard');
    return response.data.data;
  }

  // Booking Request endpoints (Caregiver)
  async getPendingRequests(): Promise<any[]> {
    const response = await this.api.get('/caregiver/pending-requests');
    return response.data.data;
  }

  async approveBookingRequest(requestId: string): Promise<any> {
    const response = await this.api.post(`/caregiver/requests/${requestId}/approve`);
    return response.data;
  }

  async rejectBookingRequest(requestId: string, rejectionReason: string): Promise<any> {
    const response = await this.api.post(`/caregiver/requests/${requestId}/reject`, {
      rejectionReason,
    });
    return response.data;
  }

  async getAllRequests(status?: string): Promise<any[]> {
    const url = status ? `/caregiver/requests?status=${status}` : '/caregiver/requests';
    const response = await this.api.get(url);
    return response.data.data;
  }

  // Booking endpoints (Caregiver)
  async getCaregiverBookings(status?: string): Promise<any[]> {
    const url = status ? `/caregiver/bookings?status=${status}` : '/caregiver/bookings';
    const response = await this.api.get(url);
    return response.data.data;
  }

  async getPendingBookings(): Promise<any[]> {
    const response = await this.api.get('/caregiver/bookings/pending');
    return response.data.data;
  }

  async approveBooking(bookingId: string): Promise<any> {
    const response = await this.api.post(`/caregiver/bookings/${bookingId}/approve`);
    return response.data;
  }

  async rejectBooking(bookingId: string, rejectionReason: string): Promise<any> {
    const response = await this.api.post(`/caregiver/bookings/${bookingId}/reject`, {
      rejectionReason,
    });
    return response.data;
  }

  async completeBooking(bookingId: string): Promise<any> {
    const response = await this.api.post(`/caregiver/bookings/${bookingId}/complete`);
    return response.data;
  }

  // Booking creation (Care Receiver)
  async createBooking(bookingData: {
    caregiverId: string;
    serviceType: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    needs?: string;
    hourlyRate: number;
  }): Promise<any> {
    const response = await this.api.post('/caregiver/bookings', bookingData);
    return response.data;
  }

  // Get all bookings for care receiver
  async getCareReceiverBookings(status?: string): Promise<any[]> {
    const url = status ? `/carereceiver/my-bookings?status=${status}` : '/carereceiver/my-bookings';
    const response = await this.api.get(url);
    return response.data.data;
  }

  // Care Documentation endpoints
  async createOrUpdateDocumentation(
    bookingId: string,
    documentationData: {
      servicesProvided?: string[];
      vitalSigns?: {
        bloodPressure?: string;
        temperature?: string;
        heartRate?: string;
        oxygenLevel?: string;
      };
      medicationAdministered?: string[];
      mealsProvided?: string[];
      activitiesPerformed?: string[];
      behavioralObservations?: string;
      incidents?: string;
      notes?: string;
    },
  ): Promise<any> {
    const response = await this.api.post(
      `/care-documentation/bookings/${bookingId}/documentation`,
      documentationData,
    );
    return response.data;
  }

  async getDocumentationByBooking(bookingId: string): Promise<any> {
    const response = await this.api.get(
      `/care-documentation/bookings/${bookingId}/documentation`,
    );
    return response.data.data.documentation;
  }

  async getCaregiverDocumentations(page = 1, limit = 10): Promise<any> {
    const response = await this.api.get(
      `/care-documentation/caregiver/documentations?page=${page}&limit=${limit}`,
    );
    return response.data;
  }

  async getCareReceiverDocumentations(page = 1, limit = 10): Promise<any> {
    const response = await this.api.get(
      `/care-documentation/carereceiver/documentations?page=${page}&limit=${limit}`,
    );
    return response.data;
  }

  async deleteDocumentation(documentationId: string): Promise<any> {
    const response = await this.api.delete(
      `/care-documentation/documentations/${documentationId}`,
    );
    return response.data;
  }

  // Todo List endpoints
  async getTodoList(bookingId: string): Promise<any[]> {
    const response = await this.api.get(
      `/care-documentation/bookings/${bookingId}/todos`,
    );
    return response.data.data.todoList;
  }

  async addTodoItem(
    bookingId: string,
    todoData: {
      text: string;
      priority?: 'low' | 'medium' | 'high';
    },
  ): Promise<any> {
    const response = await this.api.post(
      `/care-documentation/bookings/${bookingId}/todos`,
      todoData,
    );
    return response.data;
  }

  async updateTodoItem(
    bookingId: string,
    todoId: string,
    updates: {
      text?: string;
      priority?: 'low' | 'medium' | 'high';
      completed?: boolean;
    },
  ): Promise<any> {
    const response = await this.api.put(
      `/care-documentation/bookings/${bookingId}/todos/${todoId}`,
      updates,
    );
    return response.data;
  }

  async deleteTodoItem(bookingId: string, todoId: string): Promise<any> {
    const response = await this.api.delete(
      `/care-documentation/bookings/${bookingId}/todos/${todoId}`,
    );
    return response.data;
  }

  // Caregiver Payment endpoints
  async getRegistrationFeeDetails(): Promise<any> {
    const response = await this.api.get('/caregiver/payment/registration-fee');
    return response.data.data;
  }

  async processRegistrationFeePayment(paymentData: {
    paymentMethod: string;
    transactionReference?: string;
  }): Promise<any> {
    const response = await this.api.post(
      '/caregiver/payment/registration-fee',
      paymentData,
    );
    return response.data;
  }

  async getCommissionStatus(): Promise<any> {
    const response = await this.api.get('/caregiver/payment/commission-status');
    return response.data.data;
  }

  async processCommissionPayment(paymentData: {
    paymentMethod: string;
    transactionReference?: string;
  }): Promise<any> {
    const response = await this.api.post('/caregiver/payment/commission', paymentData);
    return response.data;
  }

  async getCaregiverPaymentHistory(): Promise<any[]> {
    const response = await this.api.get('/caregiver/payment/history');
    return response.data.data;
  }

  async getPaymentAnalytics(): Promise<any> {
    const response = await this.api.get('/caregiver/payment/analytics');
    return response.data.data;
  }

  // Contact endpoints
  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{status: string; message: string}> {
    const response = await this.api.post('/contact', data);
    return response.data;
  }
}

export default new ApiService();
