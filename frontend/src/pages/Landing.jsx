import { Box, Container, VStack, Stack, Heading, Text, Button, SimpleGrid, Icon, useColorModeValue, HStack } from '@chakra-ui/react';
import { FaSearch, FaMoneyBillWave, FaHospital, FaFileInvoiceDollar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';


const Feature = ({ icon, title, description }) => {
  return (
    <Stack align="center" textAlign="center">
      <Icon as={icon} w={10} h={10} color="brand.500" />
      <Text fontWeight={600} fontSize="lg">{title}</Text>
      <Text color="gray.600">{description}</Text>
    </Stack>
  );
};

function Landing() {
  const navigate = useNavigate();

  return (
      <>
      {/* Hero Section */}
      <Box 
        bg="brand.500" 
        color="white" 
        py={20}
        borderRadius="xl"
        mb={16}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} align="center" textAlign="center">
            <Heading size="2xl" fontWeight="bold">
              Find Affordable Healthcare Providers
            </Heading>
            <Text fontSize="xl" maxW="container.md">
              Your personalized health wallet
            </Text>
            <HStack spacing={4} mt={4}>
              <Button
                size="lg"
                bg="white"
                color="brand.500"
                _hover={{ bg: 'gray.100' }}
                onClick={() => navigate('/login')}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>



      {/* Features Section */}
      <Container maxW="container.xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          <Feature
            icon={FaSearch}
            title="Symptom Search"
            description="Enter your symptoms and get matched with relevant healthcare providers."
          />
          <Feature
            icon={FaMoneyBillWave}
            title="Compare Copays"
            description="Find providers with the most affordable copays for your insurance plan."
          />
          <Feature
            icon={FaHospital}
            title="Nearby Facilities"
            description="Discover quality healthcare facilities in your local area."
          />
          <Feature
            icon={FaFileInvoiceDollar}
            title="Bill Analysis"
            description="Get detailed breakdowns of your medical bills and understand your payment responsibilities."
          />
        </SimpleGrid>
      </Container>

      {/* CTA Section */}
      <Box bg="gray.50" py={16} mt={16} borderRadius="xl">
        <Container maxW="container.xl">
          <VStack spacing={6} align="center" textAlign="center">
            <Heading size="xl" style={{marginTop: '100px'}}>Ready to Find Your Provider?</Heading>
            <Text fontSize="lg" color="gray.600" maxW="container.md">
              Join thousands of patients who have found the right healthcare provider at the right price.
            </Text>
            <Button
              size="lg"
              colorScheme="brand"
              mt={4}
              onClick={() => navigate('/login')}
            >
              Search Providers Now
            </Button>
          </VStack>
        </Container>
      </Box>
      </>
  );
}

export default Landing; 