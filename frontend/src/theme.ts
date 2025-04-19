import { createTheme } from '@mui/material/styles';

// Theme: Sunshine (warm yellow)
const sunshine = createTheme({
  palette: {
    primary: { main: '#FFD54F', contrastText: '#333' },
    secondary: { main: '#FFA000', contrastText: '#fff' },
    background: { default: '#FFFDE7', paper: '#FFF9C4' },
    text: { primary: '#333', secondary: '#795548' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 8 } } },
  },
});

// Theme: Ocean (blue)
const ocean = createTheme({
  palette: {
    primary: { main: '#42A5F5', contrastText: '#fff' },
    secondary: { main: '#1565C0', contrastText: '#fff' },
    background: { default: '#E3F2FD', paper: '#BBDEFB' },
    text: { primary: '#0D47A1', secondary: '#1976D2' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 8 } } },
  },
});

// Theme: Forest (green)
const forest = createTheme({
  palette: {
    primary: { main: '#66BB6A', contrastText: '#fff' },
    secondary: { main: '#388E3C', contrastText: '#fff' },
    background: { default: '#E8F5E9', paper: '#C8E6C9' },
    text: { primary: '#1B5E20', secondary: '#388E3C' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 8 } } },
  },
});

// Theme: Sunbeam (user custom)
const sunbeam = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#FFD54F', contrastText: '#3E3E3E' }, // Sunny Yellow
    secondary: { main: '#FF7043', contrastText: '#fff' }, // Coral Pop
    background: { default: '#FFFBEA', paper: '#FFFBEA' }, // Soft Cream
    text: { primary: '#3E3E3E', secondary: '#FF7043' }, // Warm Charcoal, accent
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, background: '#FF7043', color: '#fff', '&:hover': { background: '#FFA270' } } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 8, background: '#FFFBEA' } } },
    MuiCheckbox: { styleOverrides: { root: { color: '#FF7043', '&.Mui-checked': { color: '#FF7043' } } } },
    MuiTabs: { styleOverrides: { indicator: { backgroundColor: '#FF7043' } } },
    MuiTab: { styleOverrides: { root: { color: '#3E3E3E', '&.Mui-selected': { color: '#FF7043' } } } },
  },
});

// Theme: Fresh (user custom)
const fresh = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#81C784', contrastText: '#2E3D30' }, // Herbal Green
    secondary: { main: '#64B5F6', contrastText: '#fff' }, // Sage Blue
    background: { default: '#E8F5E9', paper: '#E8F5E9' }, // Misty Mint
    text: { primary: '#2E3D30', secondary: '#64B5F6' }, // Deep Forest, accent
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, background: '#64B5F6', color: '#fff', '&:hover': { background: '#93c9fa' } } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 8, background: '#E8F5E9' } } },
    MuiCheckbox: { styleOverrides: { root: { color: '#64B5F6', '&.Mui-checked': { color: '#64B5F6' } } } },
    MuiTabs: { styleOverrides: { indicator: { backgroundColor: '#64B5F6' } } },
    MuiTab: { styleOverrides: { root: { color: '#2E3D30', '&.Mui-selected': { color: '#64B5F6' } } } },
  },
});

// Theme: Night (user custom)
const night = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#37474F', contrastText: '#E0E0E0' }, // Cool Slate
    secondary: { main: '#00BCD4', contrastText: '#121212' }, // Electric Teal
    background: { default: '#121212', paper: '#121212' }, // Deep Charcoal
    text: { primary: '#E0E0E0', secondary: '#00BCD4' }, // Light Grey, accent
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, background: '#00BCD4', color: '#121212', '&:hover': { background: '#26d7e8' } } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 8, background: '#121212' } } },
    MuiCheckbox: { styleOverrides: { root: { color: '#00BCD4', '&.Mui-checked': { color: '#00BCD4' } } } },
    MuiTabs: { styleOverrides: { indicator: { backgroundColor: '#00BCD4' } } },
    MuiTab: { styleOverrides: { root: { color: '#E0E0E0', '&.Mui-selected': { color: '#00BCD4' } } } },
  },
});

export const themes = {
  sunbeam: { theme: sunbeam, name: 'Sunbeam' },
  fresh: { theme: fresh, name: 'Fresh' },
  night: { theme: night, name: 'Night' },
};

export default sunbeam;

