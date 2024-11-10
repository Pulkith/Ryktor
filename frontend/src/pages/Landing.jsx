import { Box, Container, Text, Button, Heading, Stack, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <Container maxW="container.xl" py={8}>
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        spacing={12}
        align="center"
        justify="space-between"
      >
        <Box maxW={{ base: '100%', lg: '50%' }}>
          <Heading
            as="h1"
            size="2xl"
            color="navy.900"
            mb={6}
          >
            HealthWallet
          </Heading>
          
          <Text
            color="blue.700"
            fontSize="xl"
            fontWeight="medium"
            mb={4}
          >
            Optimizing your health, all in one place.
          </Text>
          
          <Text
            color="gray.600"
            fontSize="lg"
            mb={8}
          >
            Take control of your health. Your personal records.
            Your treatment options. Your treatment prices.
          </Text>

          <Text
            color="gray.600"
            fontSize="md"
            mb={8}
          >
            HealthWallet's features enable you to stay in charge of your health, 
            making sure you have all the information you need before making decisions 
            important to you.
          </Text>

          <Button
            size="lg"
            bg="navy.900"
            color="white"
            px={8}
            _hover={{ bg: 'navy.800' }}
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        </Box>

        <Box maxW={{ base: '100%', lg: '45%' }}>
          <Image
            src="/computer-illustration.png"
            alt="Healthcare Platform Interface"
            w="full"
            h="auto"
          />
        </Box>
      </Stack>
    </Container>
  );
}

export default Landing; 