export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  CaregiverRegister: undefined;
  CareReceiverRegister: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  CaregiverDashboard: undefined;
  CaregiverProfile: undefined;
  CareReceiverDashboard: undefined;
  CareReceiverProfile: undefined;
};

export type CaregiverTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
  Bookings: undefined;
  Requests: undefined;
  Payments: undefined;
  CareDocumentation: undefined;
};

export type CareReceiverTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
  FindCaregivers: undefined;
  Payments: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  CaregiverApp: undefined;
  CareReceiverApp: undefined;
};
