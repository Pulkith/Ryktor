import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Select,
  Button,
  Input,
  SimpleGrid,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Image,
  LinkBox,
  LinkOverlay,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useState } from 'react';
import Layout from '../components/Layout';
import { FaUpload, FaFileInvoiceDollar, FaIdCard } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const BillCard = ({ bill }) => {
  return (
    <LinkBox 
      as={Card}
      _hover={{ transform: 'scale(1.02)', transition: '0.2s' }}
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <LinkOverlay as={RouterLink} to={`/bills/${bill.id}`}>
            <Heading size="sm">Bill #{bill.id}</Heading>
          </LinkOverlay>
          
          <Image
            src={bill.imageUrl}
            alt={`Bill #${bill.id}`}
            borderRadius="md"
            fallback={<Box bg="gray.100" h="200px" />}
          />
          
          <HStack justify="space-between">
            <Text color="gray.600">
              {new Date(bill.date).toLocaleDateString()}
            </Text>
            <Badge colorScheme={bill.status === 'processed' ? 'green' : 'yellow'}>
              {bill.status}
            </Badge>
          </HStack>
          
          <Text fontWeight="bold">
            ${bill.amount}
          </Text>
          
          <Text noOfLines={2} color="gray.600">
            {bill.description || 'No description provided'}
          </Text>
        </VStack>
      </CardBody>
    </LinkBox>
  );
};

function BillingHelper() {
  const [insuranceFiles, setInsuranceFiles] = useState({ front: null, back: null });
  const [receiptFile, setReceiptFile] = useState(null);
  const toast = useToast();
  const [bills, setBills] = useState([
    {
      id: '001',
      imageUrl: 'https://example.com/bill1.jpg',
      date: '2024-03-15',
      status: 'processed',
      amount: 150.00,
      description: 'General checkup and prescription'
    },
    // Add more sample bills as needed
  ]);

  const handleInsuranceUpload = (side) => (event) => {
    const file = event.target.files[0];
    if (file) {
      setInsuranceFiles(prev => ({
        ...prev,
        [side]: file
      }));
      toast({
        title: `Insurance card ${side} uploaded`,
        status: 'success',
        duration: 3000,
      });
    }
  };

  const handleReceiptUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReceiptFile(file);
      toast({
        title: 'Receipt uploaded',
        status: 'success',
        duration: 3000,
      });
    }
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="xl" color="gray.800">
            Billing Helper
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {/* Insurance Card Upload Section */}
            <Card>
              <CardHeader>
                <Heading size="md">Insurance Card</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <Text>Upload both sides of your insurance card</Text>
                  <Input
                    type="file"
                    accept="image/*"
                    display="none"
                    id="insurance-front"
                    onChange={handleInsuranceUpload('front')}
                  />
                  <Button
                    leftIcon={<FaIdCard />}
                    onClick={() => document.getElementById('insurance-front').click()}
                    colorScheme="brand"
                    variant="outline"
                    w="full"
                  >
                    Upload Front Side
                  </Button>
                  <Input
                    type="file"
                    accept="image/*"
                    display="none"
                    id="insurance-back"
                    onChange={handleInsuranceUpload('back')}
                  />
                  <Button
                    leftIcon={<FaIdCard />}
                    onClick={() => document.getElementById('insurance-back').click()}
                    colorScheme="brand"
                    variant="outline"
                    w="full"
                  >
                    Upload Back Side
                  </Button>
                  <Button
                    colorScheme="brand"
                    variant="solid"
                    w="full"
                    onClick={()=>{}}
                    mt={2}
                  >
                    Submit
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Receipt Upload Section */}
            <Card>
              <CardHeader>
                <Heading size="md">Medical Receipt</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <Text>Upload your medical receipt for processing</Text>
                  <Select placeholder="Select illness query">
                    <option value="cold">Common Cold</option>
                    <option value="flu">Flu Symptoms</option>
                    <option value="allergies">Seasonal Allergies</option>
                    <option value="other">Other</option>
                  </Select>
                  <Input
                    type="file"
                    accept="image/*"
                    display="none"
                    id="receipt"
                    onChange={handleReceiptUpload}
                  />
                  <Button
                    leftIcon={<FaFileInvoiceDollar />}
                    onClick={() => document.getElementById('receipt').click()}
                    colorScheme="brand"
                    variant="outline"
                    w="full"
                  >
                    Upload Receipt
                  </Button>
                  <Button
                    colorScheme="brand"
                    variant="solid"
                    w="full"
                    onClick={()=>{}}
                    mt={2}
                  >
                    Submit
                  </Button>
                </VStack>
              </CardBody> 
            </Card>
          </SimpleGrid>

          {/* New Bills Section */}
          <Box mt={8}>
            <Heading size="lg" mb={4}>
              Your Medical Bills
            </Heading>
            <SimpleGrid 
              columns={{ base: 1, md: 2, lg: 3 }} 
              spacing={6}
            >
              {bills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}

export default BillingHelper; 