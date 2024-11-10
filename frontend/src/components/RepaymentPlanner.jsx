import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { optimizeRepayment } from '../services/repaymentService';

function RepaymentPlanner({ billAmount }) {
  const [formData, setFormData] = useState({
    total_amount: billAmount || 0,
    max_timeline_months: 12,
    debt_interest_rate: 0.15,
    savings_interest_rate: 0.05,
    monthly_income: 4000,
    monthly_budget: null,
  });
  const [strategies, setStrategies] = useState([]);
  const toast = useToast();

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_amount: billAmount || 0
    }));
  }, [billAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log("formData and billAmount");
        console.log(formData);
        console.log(billAmount);
      const result = await optimizeRepayment(formData);
      setStrategies(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to optimize repayment plan',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Heading size="md">Repayment Planner</Heading>
        
        <form onSubmit={handleSubmit}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Maximum Timeline (months)</FormLabel>
              <Input
                name="max_timeline_months"
                type="number"
                value={formData.max_timeline_months || ''}
                onChange={handleInputChange}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Monthly Income</FormLabel>
              <Input
                name="monthly_income"
                type="number"
                value={formData.monthly_income || ''}
                onChange={handleInputChange}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Monthly Budget (optional)</FormLabel>
              <Input
                name="monthly_budget"
                type="number"
                value={formData.monthly_budget || ''}
                onChange={handleInputChange}
              />
            </FormControl>
          </SimpleGrid>
          
          <Button mt={4} colorScheme="brand" type="submit">
            Calculate Repayment Options
          </Button>
        </form>

        {strategies.map((strategy, index) => (
          <Card key={index} mt={4}>
            <CardHeader>
              <Heading size="sm">
                Strategy {index + 1}
                {strategy.recommended && (
                  <Badge ml={2} colorScheme="green">Recommended</Badge>
                )}
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontWeight="bold">Monthly Payment</Text>
                  <Text>${strategy.monthly_payment.toFixed(2)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Total Cost</Text>
                  <Text>${strategy.total_cost.toFixed(2)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Interest Paid</Text>
                  <Text>${strategy.total_interest_paid.toFixed(2)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Potential Investment Gains</Text>
                  <Text>${strategy.potential_investment_gains.toFixed(2)}</Text>
                </Box>
              </SimpleGrid>

              <Box mt={4} overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Month</Th>
                      <Th>Payment</Th>
                      <Th>Remaining Balance</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {strategy.payment_schedule.map((payment, idx) => (
                      <Tr key={idx}>
                        <Td>{payment.month}</Td>
                        <Td>${payment.payment.toFixed(2)}</Td>
                        <Td>${payment.remaining_balance.toFixed(2)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Box mt={4}>
                <Text fontWeight="bold" mb={2}>Strategy Explanation</Text>
                <Text whiteSpace="pre-wrap" color="gray.600">
                  {strategy.explanation}
                </Text>
              </Box>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
}

export default RepaymentPlanner; 