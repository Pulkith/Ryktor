import { Box, Container } from '@chakra-ui/react';

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="background.primary">
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 