export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'caregiver' | 'carereceiver';
  phone?: string;
  address?: string;
  isActive?: boolean;
  profileImage?: string;
}

export interface Caregiver extends User {
  role: 'caregiver';
  experience?: number;
  skills?: string[];
  availability?: boolean;
  rating?: number;
  hourlyRate?: number;
  bio?: string;
  profileImage?: string;
  qualification?: string;
  specialization?: string[];
  languages?: string[];
  certificationsText?: string;
  availabilityType?: string;
  hasTransportation?: boolean;
  travelRadius?: string;
}

export interface CareReceiver extends User {
  role: 'carereceiver';
  age?: number;
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  careRequirements?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'caregiver' | 'carereceiver';
  qualification?: string;
  experience?: number;
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

export interface Payment {
  _id: string;
  amount: number;
  status: string;
  date: string;
  caregiver?: Caregiver;
  carereceiver?: CareReceiver;
}

export interface Feedback {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: User;
}
