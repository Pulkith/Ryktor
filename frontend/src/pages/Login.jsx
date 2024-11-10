import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8002/api/login', {
        email,
        password
      });

      login(response.data);
      navigate('/');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.detail || 'Something went wrong',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={16}>
      <Box
        bg={bgColor}
        p={8}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <form onSubmit={handleLogin}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={2} align="center">
              <Heading size="xl" color="gray.800">
                Welcome Back
              </Heading>
              <Text color="gray.600">
                Sign in to access your healthcare dashboard
              </Text>
            </VStack>

            <Button
              variant="outline"
              leftIcon={<FaGoogle />}
              colorScheme="gray"
              size="lg"
              w="full"
            >
              Continue with Google
            </Button>

            <HStack spacing={4}>
              <Divider />
              <Text color="gray.500" whiteSpace="nowrap" fontSize="sm">
                or sign in with email
              </Text>
              <Divider />
            </HStack>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                size="lg"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderColor={borderColor}
                color={useColorModeValue('gray.800', 'white')}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  borderColor={borderColor}
                  color={useColorModeValue('gray.800', 'white')}
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button 
              type="submit" 
              size="lg" 
              colorScheme="brand" 
              w="full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
}

export default Login; 