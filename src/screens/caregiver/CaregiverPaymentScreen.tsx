import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CaregiverTabParamList} from '../../navigation/types';
import SideMenu from '../../components/SideMenu';
import api from '../../services/api';
import {LineChart, BarChart, PieChart} from 'react-native-chart-kit';

type PaymentNavigationProp = NativeStackNavigationProp<
  CaregiverTabParamList,
  'Payments'
>;

const CaregiverPaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentNavigationProp>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Registration fee state
  const [registrationFeePaid, setRegistrationFeePaid] = useState(false);
  const [registrationFeeAmount, setRegistrationFeeAmount] = useState(0);
  const [canMakeRegistrationPayment, setCanMakeRegistrationPayment] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('');
  
  // Commission state
  const [totalBookingsCompleted, setTotalBookingsCompleted] = useState(0);
  const [bookingsSinceLastPayment, setBookingsSinceLastPayment] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [commissionDue, setCommissionDue] = useState(0);
  const [bookingsUntilNextPayment, setBookingsUntilNextPayment] = useState(5);
  const [requiresCommissionPayment, setRequiresCommissionPayment] = useState(false);
  
  // Payment history
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  
  // Payment modal
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState<'registration' | 'commission'>('registration');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Credit Card');
  const [transactionReference, setTransactionReference] = useState('');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch registration fee details
      const registrationData = await api.getRegistrationFeeDetails();
      setRegistrationFeePaid(registrationData.registrationFeePaid);
      setRegistrationFeeAmount(registrationData.registrationFeeAmount);
      setCanMakeRegistrationPayment(registrationData.canMakePayment);
      setApprovalStatus(registrationData.approvalStatus);
      
      // Fetch commission status
      const commissionData = await api.getCommissionStatus();
      setTotalBookingsCompleted(commissionData.totalBookingsCompleted);
      setBookingsSinceLastPayment(commissionData.bookingsSinceLastPayment);
      setCommissionRate(commissionData.commissionRate);
      setCommissionDue(commissionData.commissionDue);
      setBookingsUntilNextPayment(commissionData.bookingsUntilNextPayment);
      setRequiresCommissionPayment(commissionData.requiresPayment);
      
      // Fetch payment history
      const history = await api.getCaregiverPaymentHistory();
      setPaymentHistory(history);
      
    } catch (error: any) {
      console.error('Error fetching payment data:', error);
      Alert.alert('Error', 'Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = (type: 'registration' | 'commission') => {
    setPaymentType(type);
    setTransactionReference('');
    setSelectedPaymentMethod('Credit Card');
    setPaymentModalVisible(true);
  };

  const processPayment = async () => {
    try {
      setProcessing(true);
      
      if (paymentType === 'registration') {
        await api.processRegistrationFeePayment({
          paymentMethod: selectedPaymentMethod,
          transactionReference: transactionReference || undefined,
        });
        
        Alert.alert(
          'Success!',
          'Registration fee paid successfully. Your account is now active!',
          [{text: 'OK', onPress: () => {
            setPaymentModalVisible(false);
            fetchPaymentData();
          }}]
        );
      } else {
        await api.processCommissionPayment({
          paymentMethod: selectedPaymentMethod,
          transactionReference: transactionReference || undefined,
        });
        
        Alert.alert(
          'Success!',
          'Commission payment processed successfully!',
          [{text: 'OK', onPress: () => {
            setPaymentModalVisible(false);
            fetchPaymentData();
          }}]
        );
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethod = (method: string) => {
    const isSelected = selectedPaymentMethod === method;
    return (
      <TouchableOpacity
        key={method}
        style={[styles.paymentMethodOption, isSelected && styles.paymentMethodSelected]}
        onPress={() => setSelectedPaymentMethod(method)}>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.paymentMethodText}>{method}</Text>
      </TouchableOpacity>
    );
  };

  const getPaymentChartData = () => {
    // Group payments by month for the last 6 months
    const monthlyData: {[key: string]: number} = {};
    const last6Months: string[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('default', {month: 'short'});
      last6Months.push(monthKey);
      monthlyData[monthKey] = 0;
    }

    paymentHistory.forEach(payment => {
      const monthKey = new Date(payment.createdAt).toLocaleDateString('default', {
        month: 'short',
      });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += payment.amount;
      }
    });

    return {
      labels: last6Months,
      datasets: [{
        data: last6Months.map(month => monthlyData[month] / 1000), // Convert to thousands
      }],
    };
  };

  const getPaymentTypeData = () => {
    const registrationTotal = paymentHistory
      .filter(p => p.paymentType === 'registration_fee')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const commissionTotal = paymentHistory
      .filter(p => p.paymentType === 'booking_commission')
      .reduce((sum, p) => sum + p.amount, 0);

    return [
      {
        name: 'Registration',
        amount: registrationTotal,
        color: '#f59e0b',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Commission',
        amount: commissionTotal,
        color: '#8b5cf6',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
    ].filter(item => item.amount > 0);
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#8b5cf6',
    },
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payments</Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Icon name="menu" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading payment information...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Registration Fee Section */}
        {!registrationFeePaid && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Icon name="alert-circle" size={24} color="#f59e0b" />
              <Text style={styles.alertTitle}>Registration Fee Required</Text>
            </View>
            <Text style={styles.alertText}>
              {approvalStatus === 'approved'
                ? 'Your account has been approved! Please pay the registration fee to activate your account and start receiving bookings.'
                : approvalStatus === 'pending'
                ? 'Your account is pending admin approval. Once approved, you\'ll need to pay the registration fee.'
                : 'Your account registration is incomplete.'}
            </Text>
            {canMakeRegistrationPayment && (
              <>
                <View style={styles.feeBox}>
                  <Text style={styles.feeLabel}>Registration Fee</Text>
                  <Text style={styles.feeAmount}>LKR {registrationFeeAmount.toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                  style={styles.payNowButton}
                  onPress={() => handleMakePayment('registration')}>
                  <Icon name="credit-card" size={18} color="#fff" />
                  <Text style={styles.payNowButtonText}>Pay Now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {registrationFeePaid && (
          <View style={styles.successCard}>
            <Icon name="check-circle" size={32} color="#10b981" />
            <Text style={styles.successTitle}>Account Active</Text>
            <Text style={styles.successText}>
              Registration fee paid successfully!
            </Text>
          </View>
        )}

        {/* Commission Status Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="trending-up" size={24} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Booking Commission</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalBookingsCompleted}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bookingsSinceLastPayment}</Text>
              <Text style={styles.statLabel}>Since Last Payment</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress to Next Payment</Text>
              <Text style={styles.progressValue}>
                {bookingsSinceLastPayment % 20}/20 bookings
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${((bookingsSinceLastPayment % 20) / 20) * 100}%`},
                ]}
              />
            </View>
            <Text style={styles.progressHint}>
              {bookingsUntilNextPayment === 0
                ? 'Payment due now!'
                : `${bookingsUntilNextPayment} more booking${
                    bookingsUntilNextPayment > 1 ? 's' : ''
                  } until next payment`}
            </Text>
          </View>

          {requiresCommissionPayment && (
            <>
              <View style={styles.commissionDueBox}>
                <Text style={styles.commissionDueLabel}>Commission Due</Text>
                <Text style={styles.commissionDueAmount}>
                  LKR {commissionDue.toLocaleString()}
                </Text>
                <Text style={styles.commissionDueNote}>
                  LKR {commissionRate} per 20 bookings
                </Text>
              </View>
              <TouchableOpacity
                style={styles.payCommissionButton}
                onPress={() => handleMakePayment('commission')}>
                <Icon name="dollar-sign" size={18} color="#fff" />
                <Text style={styles.payCommissionButtonText}>Pay Commission</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Payment Analytics Charts */}
        {paymentHistory.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="bar-chart-2" size={24} color="#8b5cf6" />
              <Text style={styles.cardTitle}>Payment Analytics</Text>
            </View>

            {/* Payment Breakdown Pie Chart */}
            {getPaymentTypeData().length > 0 && (
              <View style={styles.chartSection}>
                <Text style={styles.chartSubtitle}>Payment Breakdown</Text>
                <PieChart
                  data={getPaymentTypeData()}
                  width={screenWidth - 64}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            )}

            {/* Monthly Payment Trend */}
            <View style={styles.chartSection}>
              <Text style={styles.chartSubtitle}>Monthly Payments (LKR '000)</Text>
              <LineChart
                data={getPaymentChartData()}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero
              />
            </View>

            {/* Summary Stats */}
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Total Paid</Text>
                <Text style={styles.summaryStatValue}>
                  LKR {paymentHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Transactions</Text>
                <Text style={styles.summaryStatValue}>{paymentHistory.length}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment History */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="list" size={24} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Payment History</Text>
          </View>

          {paymentHistory.length > 0 ? (
            paymentHistory.map((payment, index) => (
              <View key={payment._id || index} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Icon
                    name={
                      payment.paymentType === 'registration_fee'
                        ? 'user-check'
                        : 'trending-up'
                    }
                    size={20}
                    color="#8b5cf6"
                  />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyTitle}>{payment.description}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(payment.createdAt).toLocaleDateString('default', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.historyMethod}>{payment.paymentMethod}</Text>
                </View>
                <View style={styles.historyAmount}>
                  <Text style={styles.historyAmountText}>
                    LKR {payment.amount.toLocaleString()}
                  </Text>
                  <View
                    style={[
                      styles.historyStatus,
                      payment.status === 'completed'
                        ? styles.statusCompleted
                        : styles.statusPending,
                    ]}>
                    <Text
                      style={[
                        styles.historyStatusText,
                        payment.status === 'completed'
                          ? styles.statusCompletedText
                          : styles.statusPendingText,
                      ]}>
                      {payment.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="inbox" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No payment history</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {paymentType === 'registration' ? 'Pay Registration Fee' : 'Pay Commission'}
              </Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Icon name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.paymentSummary}>
                <Text style={styles.summaryLabel}>Amount to Pay</Text>
                <Text style={styles.summaryAmount}>
                  LKR{' '}
                  {(paymentType === 'registration'
                    ? registrationFeeAmount
                    : commissionDue
                  ).toLocaleString()}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                {renderPaymentMethod('Credit Card')}
                {renderPaymentMethod('Debit Card')}
                {renderPaymentMethod('Bank Transfer')}
              </View>

              <Text style={styles.inputLabel}>Transaction Reference (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter transaction reference"
                value={transactionReference}
                onChangeText={setTransactionReference}
              />

              <View style={styles.paymentNote}>
                <Icon name="info" size={16} color="#6b7280" />
                <Text style={styles.paymentNoteText}>
                  This is a simulated payment. In production, this would integrate with a payment gateway.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setPaymentModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, processing && styles.buttonDisabled]}
                onPress={processPayment}
                disabled={processing}>
                {processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="check" size={18} color="#fff" />
                )}
                <Text style={styles.modalConfirmText}>
                  {processing ? 'Processing...' : 'Confirm Payment'}
                </Text>
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
  backButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  alertText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
    marginBottom: 16,
  },
  feeBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 12,
  },
  payNowButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  successCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
    marginTop: 12,
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#047857',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  commissionDueBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  commissionDueLabel: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 4,
  },
  commissionDueAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 4,
  },
  commissionDueNote: {
    fontSize: 12,
    color: '#991b1b',
  },
  payCommissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 12,
  },
  payCommissionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  historyMethod: {
    fontSize: 11,
    color: '#9ca3af',
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
  historyAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  historyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusCompletedText: {
    color: '#065f46',
  },
  statusPendingText: {
    color: '#92400e',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  summaryStatItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  paymentSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  paymentMethodSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#8b5cf6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8b5cf6',
  },
  paymentMethodText: {
    fontSize: 15,
    color: '#374151',
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
    marginBottom: 20,
  },
  paymentNote: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
  },
  paymentNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
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
  modalConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CaregiverPaymentScreen;
