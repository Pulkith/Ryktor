import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#f8f7fc',
    100: '#e8e7f0',
    200: '#d5d3e5',
    300: '#b8b4d1',
    400: '#9691b8',
    500: '#7a739e', // Primary color - soft purple with gray undertones
    600: '#615b80',
    700: '#4a4563',
    800: '#332f47',
    900: '#1d1a2b',
  },
  background: {
    primary: '#ffffff',
    secondary: '#fafafa', // More neutral, less purple tint
  }
};

const theme = extendTheme({
  colors,
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'background.primary',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme; 