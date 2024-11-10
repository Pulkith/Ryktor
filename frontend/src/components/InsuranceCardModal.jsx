import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  SimpleGrid,
  Box,
} from '@chakra-ui/react';

const InsuranceCardModal = ({ isOpen, onClose, insuranceData }) => {
  console.log("insuranceData");
  console.log(insuranceData);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Insurance Card Information</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text fontWeight="bold">First Name</Text>
              <Text>{insuranceData?.["First Name"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Last Name</Text>
              <Text>{insuranceData?.["Last Name"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Policy Number</Text>
              <Text>{insuranceData?.["Policy Number"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Group Number</Text>
              <Text>{insuranceData?.["Group Number"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Member ID</Text>
              <Text>{insuranceData?.["Member ID"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Insurance Company</Text>
              <Text>{insuranceData?.["Insurance Company"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Insurance Plan</Text>
              <Text>{insuranceData?.["Insurance Plan"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Insurance Type</Text>
              <Text>{insuranceData?.["Insurance Type"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Effective Date</Text>
              <Text>{insuranceData?.["Effective Date"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">In Network Deductible</Text>
              <Text>${insuranceData?.["In Network Deductible"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Out of Network Deductible</Text>
              <Text>${insuranceData?.["Out of Network Deductible"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">In Network Out of Pocket Max</Text>
              <Text>${insuranceData?.["In Network Out of Pocket Max"]}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Out of Network Out of Pocket Max</Text>
              <Text>${insuranceData?.["Out of Network Out of Pocket Max"]}</Text>
            </Box>
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InsuranceCardModal; 