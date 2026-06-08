export type AuthStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  CaregiverRegister: undefined;
  CareReceiverRegister: undefined;
  ForgotPassword: undefined;
  CaregiverForgotPassword: undefined;
  CareReceiverForgotPassword: undefined;
  ResetPassword: { email?: string };
  ContactUs: undefined;
  AboutUs: undefined;
};

export type AppStackParamList = {
  CaregiverDashboard: undefined;
  CaregiverProfile: undefined;
  CareReceiverDashboard: undefined;
  CareReceiverProfile: undefined;
};

export type CaregiverTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  CareDocumentation: undefined;
  Profile: undefined;
  Payments: undefined;
  ContactUs: undefined;
  AboutUs: undefined;
};

export type CareReceiverTabParamList = {
  Dashboard: undefined;
  FindCaregivers: undefined;
  Bookings: undefined;
  Profile: undefined;
  ContactUs: undefined;
  AboutUs: undefined;
  ReviewsRatings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  CaregiverPending: undefined;
  CaregiverApp: undefined;
  CareReceiverApp: undefined;
};
