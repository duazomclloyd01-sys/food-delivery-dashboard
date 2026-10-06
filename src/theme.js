export const COLORS = {
  primary: '#F26B1D',
  gradientStart: '#FF8A3D',
  gradientEnd: '#E8541A',
  background: '#F4F5F7',
  card: '#FFFFFF',
  text: '#1F1F1F',
  secondaryText: '#8A8F98',
  muted: '#B9BEC6',
  border: '#EAECEF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  lightOrange: '#FFF1E6',
  darkOrange: '#C24E0E',
  sidebarBg: '#1F1F1F',
  sidebarActive: '#F26B1D',
};

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const SHADOW = {
  card: {
    shadowColor: '#1F1F1F',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  button: {
    shadowColor: '#F26B1D',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

export const FONTS = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  light: 'Poppins_300Light',
};

export const SERVICE_FEE = 49;

export const peso = (n) => {
  const v = Math.round(n * 100) / 100;
  return '₱' + v.toLocaleString('en-PH', {
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};
