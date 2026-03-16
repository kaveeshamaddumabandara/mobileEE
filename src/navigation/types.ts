export type AuthStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  CaregiverRegister: undefined;
  CareReceiverRegister: undefined;
  ForgotPassword: undefined;
  ContactUs: undefined;
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
};

export type CareReceiverTabParamList = {
  Dashboard: undefined;
  FindCaregivers: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  CaregiverApp: undefined;
  CareReceiverApp: undefined;
};
