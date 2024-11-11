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
  import { getUserIllnesses, getAllBillingReceptions, deleteBill,getAllBillingRecords } from '../services/billingService';
  import { useAuth } from '../context/AuthContext';
  import { uploadInsuranceCard } from '../services/billingService';
  import { uploadRecord } from '../services/billingService';
  
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
                <Heading size="sm">Record #{bill._id}</Heading>
              <IconButton
                icon={<FaTrash />}
                variant="ghost"
                colorScheme="red"
                size="sm"
                onClick={handleDelete}
                aria-label="Delete bill"
              />
            </HStack>
            
            <embed
              src={
                bill && 
                "uploaded_files/" + bill['user_id'] + "/" + bill['file_name']
              }
              alt={`Bill #${bill.id}`}
              borderRadius="md"
              height={200}
            //   objectFit="cover"
            //   fallback={<Box bg="gray.100" h="200px" />}
            />
            
            <HStack justify="space-between">
              <Text color="gray.600">
                {new Date(bill && bill['created_at']).toLocaleDateString()}
              </Text>
              <Badge colorScheme={bill.status !== 'processed' ? 'green' : 'yellow'}>
                {'processed'}
              </Badge>
            </HStack>
            
            
          </VStack>
        </CardBody>
      </LinkBox>
    );
  };
  
  function BillingHelper() {
    const navigate = useNavigate();
    const [receiptFile, setReceiptFile] = useState(null);
    const toast = useToast();
    const [bills, setBills] = useState([]);
    const [selectedIllness, setSelectedIllness] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: authLoading } = useAuth();
    const [isReceiptSubmitting, setIsReceiptSubmitting] = useState(false);
  
    const fetchData = async () => {
      if (!user) return;
      console.log("fetching data");
      console.log(user);
      
      try {
        const [fetchedIllnesses, fetchedReceipts] = await Promise.all([
          getUserIllnesses(user._id),
          getAllBillingRecords(user._id)
        ]);
        console.log(fetchedReceipts)
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
  
      setIsReceiptSubmitting(true);
      try {
        const result = await uploadRecord(
          receiptFile,
          user._id
        );
        
        toast({
          title: 'Success',
          description: 'Medical record processed successfully',
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
          description: error.response?.data?.detail || 'Failed to process medical record',
          status: 'error',
          duration: 5000,
        });
        alert(error)
      } finally {
        setIsReceiptSubmitting(false);
      }
    };
  
    const handleDeleteBill = (billId) => {
    //   setBills(prevBills => prevBills.filter(bill => bill._id !== billId));
    };
  
  
    return (
      // <Layout>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Heading size="xl" color="gray.800">
              Record Helper
            </Heading>
  
            <SimpleGrid columns={{ base: 1}} spacing={8}>
  
              {/* Receipt Upload Section */}
              <Card>
                <CardHeader>
                  <Heading size="md">Document Upload</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <Text>Upload Medical Records for more personalized healthcare. </Text>
                    <Input
                      type="file"
                      accept="pdf"
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
                      {receiptFile ? 'Edit Document' : 'Upload Document'}
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
                Your Documents
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