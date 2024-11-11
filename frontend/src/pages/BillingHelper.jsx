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
  IconButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FaUpload, FaFileInvoiceDollar, FaIdCard, FaTrash } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { getUserIllnesses, getAllBillingReceptions, deleteBill } from '../services/billingService';
import { useAuth } from '../context/AuthContext';
import { uploadInsuranceCard } from '../services/billingService';
import { uploadReceipt } from '../services/billingService';
import { getInsuranceCard } from '../services/billingService';
import InsuranceCardModal from '../components/InsuranceCardModal';

const BillCard = ({ bill, onDelete }) => {
  const toast = useToast();

  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      await deleteBill(bill._id);
      onDelete(bill._id);
      toast({
        title: 'Success',
        description: 'Bill deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete bill',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <LinkBox 
      as={Card}
      _hover={{ transform: 'scale(1.02)', transition: '0.2s' }}
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <LinkOverlay as={RouterLink} to={`/bills/${bill && bill['_id']}`}>
              <Heading size="sm">Bill #{bill._id}</Heading>
            </LinkOverlay>
            <IconButton
              icon={<FaTrash />}
              variant="ghost"
              colorScheme="red"
              size="sm"
              onClick={handleDelete}
              aria-label="Delete bill"
            />
          </HStack>
          
          <Image
            src={
              bill.processed_data && 
              "uploaded_files/" + bill['user_id'] + "/" + bill.processed_data['file_name']
            }
            alt={`Bill #${bill.id}`}
            borderRadius="md"
            height={200}
            objectFit="cover"
            fallback={<Box bg="gray.100" h="200px" />}
          />
          
          <HStack justify="space-between">
            <Text color="gray.600">
              {new Date(bill.processed_data && bill.processed_data['Date of Service']).toLocaleDateString()}
            </Text>
            <Badge colorScheme={bill.status !== 'processed' ? 'green' : 'yellow'}>
              {'processed'}
            </Badge>
          </HStack>
          
          <Text fontWeight="bold">
            {bill && bill.processed_data && bill.processed_data['Patient Responsibility Remaining']}
          </Text>
          
          <Text noOfLines={2} color="gray.600">
            {bill.processed_data && bill.processed_data['services'].length} services 
            rendered at {bill.processed_data && bill.processed_data['Hospital Name']}
          </Text>
        </VStack>
      </CardBody>
    </LinkBox>
  );
};

function BillingHelper() {
  const navigate = useNavigate();
  const [insuranceFiles, setInsuranceFiles] = useState({ front: null, back: null });
  const [receiptFile, setReceiptFile] = useState(null);
  const toast = useToast();
  const [bills, setBills] = useState([]);
  const [illnesses, setIllnesses] = useState([]);
  const [selectedIllness, setSelectedIllness] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [insuranceData, setInsuranceData] = useState(null);
  const [isInsuranceSubmitting, setIsInsuranceSubmitting] = useState(false);
  const [isReceiptSubmitting, setIsReceiptSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    console.log("fetching data");
    console.log(user);
    
    try {
      const [fetchedIllnesses, fetchedReceipts] = await Promise.all([
        getUserIllnesses(user._id),
        getAllBillingReceptions(user._id)
      ]);
      
      setIllnesses(fetchedIllnesses);
      setBills(fetchedReceipts);
    } catch (error) {
      toast({
        title: 'Error fetching data',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading, navigate, toast]);

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
    console.log(insuranceFiles);
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

  const handleInsuranceSubmit = async () => {
    if (!insuranceFiles.front && !insuranceFiles.back) {
      toast({
        title: 'Missing files',
        description: 'Please upload your insurance card',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsInsuranceSubmitting(true);
    try {
      const result = await uploadInsuranceCard(
        insuranceFiles.front,
        insuranceFiles.back,
        user._id
      );
      
      toast({
        title: 'Success',
        description: 'Insurance card processed successfully',
        status: 'success',
        duration: 3000,
      });
      
      console.log(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to process insurance card',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsInsuranceSubmitting(false);
    }
  };

  const handleReceiptSubmit = async () => {
    if (!receiptFile) {
      toast({
        title: 'Missing file',
        description: 'Please upload a medical receipt',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!selectedIllness) {
      toast({
        title: 'Missing illness',
        description: 'Please select an illness for this receipt',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsReceiptSubmitting(true);
    try {
      const result = await uploadReceipt(
        receiptFile,
        selectedIllness,
        user._id
      );
      
      toast({
        title: 'Success',
        description: 'Medical receipt processed successfully',
        status: 'success',
        duration: 3000,
      });
      
      // Clear the form
      setReceiptFile(null);
      setSelectedIllness('');
      
      // Fetch updated bills
      await fetchData();
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to process medical receipt',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsReceiptSubmitting(false);
    }
  };

  const handleDeleteBill = (billId) => {
    setBills(prevBills => prevBills.filter(bill => bill._id !== billId));
  };

  const handleViewInsurance = async () => {
    console.log("user");
    console.log(user);
    try {
      const data = await user.insurance_card;
      console.log(data)
      setInsuranceData(data);
      setIsInsuranceModalOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to fetch insurance card',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    // <Layout>
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
                    {insuranceFiles.front ? 'Edit Front Side' : 'Reupload Front Side'}
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
                    {insuranceFiles.back ? 'Edit Back Side' : 'Reupload Back Side'}
                  </Button>
                  <Button
                    colorScheme="brand"
                    variant="solid"
                    w="full"
                    onClick={handleInsuranceSubmit}
                    mt={2}
                    isLoading={isInsuranceSubmitting}
                    loadingText="Submitting..."
                  >
                    Submit
                  </Button>
                  <Button
                    colorScheme="brand"
                    variant="ghost"
                    w="full"
                    onClick={handleViewInsurance}
                    isDisabled={user && !user?.insurance_card}
                  >
                    View Insurance Card
                  </Button>
                  <InsuranceCardModal
                    isOpen={isInsuranceModalOpen}
                    onClose={() => setIsInsuranceModalOpen(false)}
                    insuranceData={insuranceData}
                  />
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
                  <Select 
                    placeholder="Select illness query"
                    onChange={(e) => setSelectedIllness(e.target.value)}
                    value={selectedIllness}
                  >
                    {illnesses.map((illness, index) => (
                      <option key={index} value={illness}>{illness}</option>
                    ))}
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
                    {receiptFile ? 'Edit Receipt' : 'Upload Receipt'}
                  </Button>
                  <Button
                    colorScheme="brand"
                    variant="solid"
                    w="full"
                    onClick={handleReceiptSubmit}
                    mt={2}
                    isLoading={isReceiptSubmitting}
                    loadingText="Submitting..."
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
                <BillCard key={bill._id} bill={bill} onDelete={handleDeleteBill} />
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    // </Layout>
  );
}

export default BillingHelper; 