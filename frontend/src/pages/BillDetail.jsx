import {
  Container,
  VStack,
  Heading,
  Text,
  Image,
  Button,
  HStack,
  Badge,
  Box,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Layout from '../components/Layout';

function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, you would fetch the bill details using the id
  const bill = {
    id,
    imageUrl: 'https://example.com/bill1.jpg',
    date: '2024-03-15',
    status: 'processed',
    amount: 150.00,
    description: 'General checkup and prescription',
    provider: 'City Medical Center',
    insuranceResponsibility: 120.00,
    patientResponsibility: 30.00,
  };

  return (
    <Layout>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Heading size="lg">Bill #{id}</Heading>
          </HStack>

          <Box borderRadius="lg" overflow="hidden">
            <Image
              src={bill.imageUrl}
              alt={`Bill #${id}`}
              w="full"
              fallback={<Box bg="gray.100" h="400px" />}
            />
          </Box>

          <VStack spacing={4} align="stretch" p={6} bg="white" borderRadius="lg" shadow="sm">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Status</Text>
              <Badge colorScheme={bill.status === 'processed' ? 'green' : 'yellow'}>
                {bill.status}
              </Badge>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Date</Text>
              <Text>{new Date(bill.date).toLocaleDateString()}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Provider</Text>
              <Text>{bill.provider}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Total Amount</Text>
              <Text>${bill.amount}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Insurance Responsibility</Text>
              <Text>${bill.insuranceResponsibility}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Patient Responsibility</Text>
              <Text>${bill.patientResponsibility}</Text>
            </HStack>

            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={2}>Description</Text>
              <Text color="gray.600">{bill.description}</Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Layout>
  );
}

export default BillDetail; 