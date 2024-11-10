import { Box } from '@chakra-ui/react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="background.primary">
      <Header />
      {children}
    </Box>
  );
};

export default Layout; 