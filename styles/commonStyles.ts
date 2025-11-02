
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#A9D6E5',
  primaryLight: '#E8F4F8',
  secondary: '#FAD4D8',
  accent: '#FF6B9D',
  background: '#F3F3F3',
  backgroundSecondary: '#E0E0E0', // ✅ Added property
  card: '#FFFFFF',
  white: '#FFFFFF',
  text: '#003049',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF5252',
  info: '#2196F3',
  lightBlue: '#ADD8E6',
  lightGray: '#D3D3D3',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  cardWhite: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
