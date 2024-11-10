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
import { useState, useEffect } from 'react';
import { getBillById } from '../services/billingService';
import RepaymentPlanner from '../components/RepaymentPlanner';

function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState({});
  const [billAmount, setBillAmount] = useState(0);

  useEffect(() => {
    // Fetch bill details
    getBillById(id)
      .then((data) => {
        setBill(data);
        if (data.processed_data && data.processed_data['Patient Responsibility Remaining']) {
          console.log("data.processed_data['Patient Responsibility Remaining']");
          console.log(data.processed_data['Patient Responsibility Remaining']);
          // remove any non-numeric characters
          const cleaned_str = data.processed_data['Patient Responsibility Remaining'].replace(/[^0-9.]/g, '');
          const amount = parseFloat(cleaned_str);
          if (!isNaN(amount)) {
            setBillAmount(amount);
          }
        }
        console.log(data);
      })
      .catch((error) => console.error(error));
  }, [id]);


  // In a real app, you would fetch the bill details using the id
  

  return (
    // <Layout>
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
              src={
                bill.processed_data && 
                "/uploaded_files/" + bill['user_id'] + "/" + bill.processed_data['file_name']
              }
              alt={`Bill #${id}`}
              w="full"
              fallback={<Box bg="gray.100" h="400px" />}
            />
          </Box>

          <VStack spacing={4} align="stretch" p={6} bg="white" borderRadius="lg" shadow="sm">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Status</Text>
              <Badge colorScheme={bill.status !== 'processed' ? 'green' : 'yellow'}>
                {'processed'}
              </Badge>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Date</Text>
              <Text>{new Date(bill.processed_data && bill.processed_data['Date of Service']).toLocaleDateString()}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Provider</Text>
              <Text>{bill.processed_data && bill.processed_data['Hospital Name']}
               {" "}at {bill.processed_data && bill.processed_data['Full Location']}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Total Amount</Text>
              <Text>{bill.processed_data && bill.processed_data['Total Amount Charged']}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Insurance Responsibility</Text>
              <Text>{bill.processed_data && bill.processed_data['Insurance Responibility']}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Patient Responsibility</Text>
              <Text>{bill.processed_data && bill.processed_data['Patient Responsibility Remaining']}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Possible Incorrect or Upcoded Charges</Text>
              <Text>{bill.processed_data && bill.processed_data['Possible Incorrect or Upcoded Charges']}</Text>
            </HStack>

            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={2}>Services</Text>
              <Text color="gray.600">
                {
                  
                  bill.processed_data && bill.processed_data['services'].map((service, index) => {
                    return (
                      <Text key={index}>
                        {service['Service Name']} on {service['Service Date']}:  {service['Amount Charged']}
                      </Text>
                    )
                })
              }
                
              </Text>
            </Box>
          </VStack>

          <Box mt={8}>
            <RepaymentPlanner billAmount={billAmount} />
          </Box>
        </VStack>
      </Container>
    // </Layout>
  );
}

export default BillDetail; 