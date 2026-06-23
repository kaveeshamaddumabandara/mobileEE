import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useAuth} from '../../context/AuthContext';

const CaregiverPendingScreen: React.FC = () => {
  const {user, logout, refreshUserStatus} = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserStatus();
      // If user is now verified, RootNavigator will automatically re-route
    } catch {
      Alert.alert('Error', 'Could not refresh your status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: () => logout()},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ElderEase</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="log-out" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="clock" size={48} color="#f59e0b" />
        </View>

        <Text style={styles.title}>Application Under Review</Text>
        <Text style={styles.subtitle}>
          Hi {user?.name?.split(' ')[0] || 'there'}, your caregiver application
          has been submitted and is currently being reviewed by our admin team.
        </Text>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>What happens next?</Text>

          <View style={styles.step}>
            <View style={[styles.stepDot, styles.stepDone]}>
              <Icon name="check" size={14} color="#fff" />
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepLabel}>Registration Submitted</Text>
              <Text style={styles.stepDesc}>
                Your details and documents have been received.
              </Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.step}>
            <View style={[styles.stepDot, styles.stepActive]}>
              <Icon name="search" size={14} color="#fff" />
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepLabel}>Admin Review</Text>
              <Text style={styles.stepDesc}>
                Our team is verifying your qualifications and documents.
              </Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.step}>
            <View style={[styles.stepDot, styles.stepPending]}>
              <Icon name="credit-card" size={14} color="#9ca3af" />
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepLabel, styles.stepLabelPending]}>
                Pay Registration Fee
              </Text>
              <Text style={styles.stepDesc}>
                Once approved, pay the LKR 1,000 one-time registration fee.
              </Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.step}>
            <View style={[styles.stepDot, styles.stepPending]}>
              <Icon name="zap" size={14} color="#9ca3af" />
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepLabel, styles.stepLabelPending]}>
                Account Activated
              </Text>
              <Text style={styles.stepDesc}>
                Your profile will be visible to care receivers and you can start
                accepting bookings.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Icon name="mail" size={18} color="#2563eb" />
          <Text style={styles.infoText}>
            You will receive an email notification at{' '}
            <Text style={styles.infoEmail}>{user?.email}</Text> once your
            application is approved or if further information is needed.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.refreshBtn, refreshing && styles.refreshBtnDisabled]}
          onPress={handleRefresh}
          disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator color="#2563eb" />
          ) : (
            <>
              <Icon name="refresh-cw" size={18} color="#2563eb" />
              <Text style={styles.refreshBtnText}>Check Approval Status</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutTextBtn} onPress={handleLogout}>
          <Text style={styles.logoutTextBtnText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  logoutBtn: {padding: 4},
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#f59e0b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepLine: {
    width: 2,
    height: 14,
    backgroundColor: '#e5e7eb',
    marginLeft: 15,
    marginVertical: 4,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepDone: {backgroundColor: '#10b981'},
  stepActive: {backgroundColor: '#f59e0b'},
  stepPending: {backgroundColor: '#e5e7eb'},
  stepBody: {flex: 1, paddingBottom: 4},
  stepLabel: {fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2},
  stepLabelPending: {color: '#9ca3af'},
  stepDesc: {fontSize: 13, color: '#6b7280', lineHeight: 18},
  infoBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 28,
  },
  infoText: {fontSize: 13, color: '#6b7280', flex: 1, lineHeight: 18},
  infoEmail: {fontWeight: '600', color: '#2563eb'},
  refreshBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  refreshBtnDisabled: {opacity: 0.6},
  refreshBtnText: {fontSize: 16, fontWeight: '700', color: '#2563eb'},
  logoutTextBtn: {paddingVertical: 8},
  logoutTextBtnText: {fontSize: 15, color: '#9ca3af', textDecorationLine: 'underline'},
});

export default CaregiverPendingScreen;
