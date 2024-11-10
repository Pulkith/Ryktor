import { Box, VStack, HStack, Text, Badge, Icon } from '@chakra-ui/react';
import { FaStar, FaHospital, FaDollarSign } from 'react-icons/fa';

const ProviderCard = ({ provider }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      bg="white"
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            {provider.name}
          </Text>
          <Badge colorScheme="brand" fontSize="sm">
            {provider.specialty}
          </Badge>
        </HStack>
        
        <HStack spacing={4}>
          <Icon as={FaStar} color="yellow.400" />
          <Text>{provider.rating}/5.0</Text>
          <Icon as={FaDollarSign} color="green.500" />
          <Text>${provider.cost_estimate}</Text>
        </HStack>

        <Text color="gray.600">{provider.address}</Text>
        
        <HStack wrap="wrap" spacing={2}>
          {provider.insurance_accepted.map((insurance) => (
            <Badge key={insurance} colorScheme="gray">
              {insurance}
            </Badge>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProviderCard; 