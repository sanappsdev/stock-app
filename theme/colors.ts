/**
 * App Theme Colors
 * 
 * Primary: #693EFE (Purple) - Main brand color for buttons, accents, and primary actions
 * Secondary: #D3FE3E (Lime Green) - Secondary actions, highlights, success states
 */

export const colors = {
  // Primary Colors
  primary: '#693EFE',
  primaryDark: '#4D2DB8',
  primaryLight: '#8B5FFF',
  primaryLighter: '#B89AFF',
  
  // Secondary Colors
  secondary: '#D3FE3E',
  secondaryDark: '#B8E02A',
  secondaryLight: '#E5FF6B',
  
  // Background Colors
  background: '#F8F9FA',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#F0F1F3',
  
  // Text Colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textLight: '#FFFFFF',
  
  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  
  // Status Colors
  success: '#4CAF50',
  successLight: '#81C784',
  error: '#F44336',
  errorLight: '#E57373',
  warning: '#FF9800',
  warningLight: '#FFB74D',
  info: '#2196F3',
  infoLight: '#64B5F6',
  
  // Special Colors
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Card Colors
  card: '#FFFFFF',
  cardShadow: 'rgba(105, 62, 254, 0.1)',
} as const;

export type Colors = typeof colors;
