import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/medbank4.png';

const Header = () => {
  const { user, logout } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Container maxW="container.xl">
        <Flex h="60px" align="center" justify="space-between">
          <HStack spacing={4} as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <Image 
              src={logo} 
              alt="Health Wallet Logo" 
              w={20} 
              h={20}
              objectFit="contain"
            />
            <Text
              fontSize="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, purple.500)"
              bgClip="text"
            >
              Medbank
            </Text>
          </HStack>

          <HStack spacing={4}>
          <Button
              as={RouterLink}
              to="/landing"
              variant="ghost"
              colorScheme="brand"
              size="sm"
            >
              About
            </Button>
            <Button
              as={RouterLink}
              to="/billing"
              variant="ghost"
              colorScheme="brand"
              size="sm"
            >
              Billing Helper
            </Button>
            <Button
              as={RouterLink}
              to="/records"
              variant="ghost"
              colorScheme="brand"
              size="sm"
            >
               Record Helper
            </Button>
            <Button
              as={RouterLink}
              to="/"
              variant="ghost"
              colorScheme="brand"
              size="sm"
            >
               Care Finder
            </Button>
            {user ? (
              <Button
                onClick={logout}
                variant="outline"
                colorScheme="brand"
                size="sm"
              >
                Logout
              </Button>
            ) : (
              <Button
                as={RouterLink}
                to="/login"
                colorScheme="brand"
                size="sm"
              >
                Login
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header; 