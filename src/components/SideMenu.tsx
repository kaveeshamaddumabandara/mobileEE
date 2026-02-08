import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useAuth} from '../context/AuthContext';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

const SideMenu: React.FC<SideMenuProps> = ({visible, onClose, navigation}) => {
  const {user, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          onClose();
          logout();
        },
      },
    ]);
  };

  const handleMenuOption = (option: string) => {
    onClose();
    switch (option) {
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'bookings':
        navigation.navigate('Bookings');
        break;
      case 'careDocumentation':
        navigation.navigate('CareDocumentation');
        break;
      case 'payments':
        navigation.navigate('Payments');
        break;
      case 'about':
        Alert.alert(
          'About Us',
          'CareConnect - Connecting caregivers with those who need care.',
        );
        break;
      case 'contact':
        Alert.alert(
          'Contact',
          'Email: support@careconnect.com\nPhone: +94 11 234 5678',
        );
        break;
      case 'help':
        Alert.alert('Help', 'For assistance, please contact our support team.');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <SafeAreaView style={styles.menuContainer}>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.menuHeader}>
            <View style={styles.menuAvatar}>
              {user?.profileImage ? (
                <Image
                  source={{uri: user.profileImage}}
                  style={styles.menuAvatarImage}
                />
              ) : (
                <Text style={styles.menuAvatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'C'}
                </Text>
              )}
            </View>
            <Text style={styles.menuUserName}>
              {user?.name || 'Caregiver'}
            </Text>
            <Text style={styles.menuUserRole}>Caregiver</Text>
          </View>

          <ScrollView
            style={styles.menuContent}
            showsVerticalScrollIndicator={false}>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption('dashboard')}>
            <View style={styles.iconContainer}>
              <Icon name="home" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.menuItemText}>Dashboard</Text>
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption('profile')}>
            <View style={styles.iconContainer}>
              <Icon name="user" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.menuItemText}>My Profile</Text>
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption('bookings')}>
            <View style={styles.iconContainer}>
              <Icon name="calendar" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.menuItemText}>My Bookings</Text>
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption('careDocumentation')}>
            <View style={styles.iconContainer}>
              <Icon name="file-text" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.menuItemText}>Care Documentation</Text>
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption('payments')}>
            <View style={styles.iconContainer}>
              <Icon name="credit-card" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.menuItemText}>Payments</Text>
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption('about')}>
            <View style={styles.iconContainer}>
              <Icon name="info" size={20} color="#6b7280" />
            </View>
            <Text style={styles.menuItemText}>About Us</Text>
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption('contact')}>
            <View style={styles.iconContainer}>
              <Icon name="phone" size={20} color="#6b7280" />
            </View>
            <Text style={styles.menuItemText}>Contact</Text>
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption('help')}>
            <View style={styles.iconContainer}>
              <Icon name="help-circle" size={20} color="#6b7280" />
            </View>
            <Text style={styles.menuItemText}>Help</Text>
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => handleMenuOption('logout')}>
            <View style={styles.iconContainer}>
              <Icon name="log-out" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.menuItemText, {color: '#ef4444'}]}>
              Logout
            </Text>
          </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    width: 300,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 5,
    paddingBottom: 2,
  },
  closeButton: {
    padding: 4,
  },
  menuHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  menuAvatarImage: {
    width: '100%',
    height: '100%',
  },
  menuAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  menuUserRole: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#f9fafb',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 12,
  },
  logoutItem: {
    backgroundColor: '#fef2f2',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
});

export default SideMenu;
