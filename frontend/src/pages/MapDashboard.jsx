import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Card,
  CardBody,
  Checkbox,
  Button,
  Flex,
  Icon,
  IconButton,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Progress,
  Heading,
} from '@chakra-ui/react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { FaNotesMedical } from 'react-icons/fa'; // or another medical-themed icon

import { FaSearch, FaMicrophone } from 'react-icons/fa';

import { transcribeAudio } from '../services/audioService';

const containerStyle = {
  width: '100%',
  height: '70vh',
};

function MapDashboard() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [center, setCenter] = useState({ lat: 39.95, lng: -75.1943 }); // Default center
  const [hoveredHospital, setHoveredHospital] = useState(null);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for storing search input
  const [isFocused, setIsFocused] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitalCount, setHospitalCount] = useState(50);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [mapCenter, setMapCenter] = useState(center);  // Add this state for visual center
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimerId, setRecordingTimerId] = useState(null);

  const toast = useToast();

  // Add these color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('brand.200', 'gray.600');
  const hoverBorderColor = useColorModeValue('brand.300', 'gray.500');

  // Debounce the hospital updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setHospitalCount(hospitalCount);
    }, 100);  // Small delay to batch updates

    return () => clearTimeout(timer);
  }, [hospitalCount]);

  // Get the user's current location and set it as the new center
  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          setCenter(pos);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else if (!useCurrentLocation) {
      // Default location (e.g., Princeton)
      const defaultLocation = {
        lat: 40.3573,
        lng: -74.6672
      };
      setUserLocation(null);  // Hide user location marker
      setCenter(defaultLocation);
    }
  }, [useCurrentLocation]);  // Dependency on checkbox state

  // Calculate nearest hospitals based on the center point and hospitalCount
  useEffect(() => {
    const fetchNearestHospitals = async () => {
      try {
        const response = await axios.post('http://localhost:8002/api/nearest', {
          center: {
            lat: center.lat,
            lng: center.lng
          },
          count: hospitalCount,
          searchTerm: searchTerm || undefined
        });

        console.log("API Response:", response.data); // Debug log
        setNearestHospitals(response.data);
      } catch (error) {
        console.error('Error fetching nearest hospitals:', error);
        toast({
          title: 'Error fetching hospitals',
          description: error.response?.data?.detail || 'Something went wrong',
          status: 'error',
          duration: 5000,
        });
        setNearestHospitals([]);
      }
    };

    if (center && hospitalCount > 0) {
      fetchNearestHospitals();
    }
  }, [center, hospitalCount]);

  const handleGetDirections = (hospital) => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${hospital.LATITUDE},${hospital.LONGITUDE}`;
    window.open(directionsUrl, '_blank'); // Opens directions in a new tab
  };

  // Add handler for map center changes
  const handleCenterChanged = () => {
    if (mapRef.current) {
      setMapCenter(mapRef.current.getCenter().toJSON());
    }
  };

  // Add ref for the map
  const mapRef = React.useRef(null);

  const handleFindNearby = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter().toJSON();
      console.log("New center:", newCenter); // Debug log
      setCenter(newCenter);
    }
  };

  // Add this console log to verify the data
  useEffect(() => {
    console.log("Nearest hospitals:", nearestHospitals);
  }, [nearestHospitals]);

  const handleVoiceSearch = async () => {
    console.log('Voice search button clicked');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('MediaRecorder API not supported in this browser');
      toast({
        title: 'Error',
        description: 'Voice recording is not supported in this browser',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      if (!isRecording) {
        // Reset recording time
        setRecordingTime(0);
        
        console.log('Requesting microphone permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
        
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        
        recorder.ondataavailable = (e) => {
          console.log('Data available from recorder', e.data.size);
          chunksRef.current.push(e.data);
        };
        
        recorder.onstop = async () => {
          console.log('Recording stopped, processing audio...');
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
          
          console.log('Audio blob created:', audioBlob);
          
          try {
            const transcribedText = await transcribeAudio(audioBlob);
            console.log('Transcribed text:', transcribedText);
            setSearchTerm(transcribedText);
          } catch (error) {
            console.error('Error transcribing audio:', error);
            toast({
              title: 'Error',
              description: 'Failed to transcribe audio',
              status: 'error',
              duration: 3000,
            });
          }
          
          // Clear timer and reset states
          if (recordingTimerId) {
            clearInterval(recordingTimerId);
            setRecordingTimerId(null);
          }
          setRecordingTime(0);
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
        };
        
        recorder.start();
        setIsRecording(true);
        console.log('Recording started');
        
        // Start timer
        const timerId = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setRecordingTimerId(timerId);
        
        // Auto-stop after 120 seconds (2 minutes)
        setTimeout(() => {
          if (recorder.state === 'recording') {
            console.log('Auto-stopping recording after 120 seconds');
            recorder.stop();
            clearInterval(timerId);
            setRecordingTimerId(null);
          }
        }, 120000);
        
      } else {
        // Stop recording
        console.log('Stopping recording');
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
        if (recordingTimerId) {
          clearInterval(recordingTimerId);
          setRecordingTimerId(null);
        }
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to access microphone',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerId) {
        clearInterval(recordingTimerId);
      }
    };
  }, [recordingTimerId]);

  return isLoaded ? (
    <Box
      padding={0}
      position="relative"
      minHeight="180vh"
      background="linear-gradient(180deg, brand.500 0%, brand.200 100%)"
      backgroundAttachment="fixed"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: "linear-gradient(180deg, rgba(122,115,158,0.9) 0%, rgba(213,211,229,0.7) 100%)",
        zIndex: 0
      }}
    >
      <Container 
        maxW="container.xl" 
        height="100vh"
        py={8}
        display="flex" 
        flexDirection="column"
      >
        <VStack spacing={8} align="stretch" height="100%">
          {/* Location Controls Group */}
          <Card 
            bg="transparent" 
            borderColor={borderColor} 
            shadow="none"
            position="absolute"
            top="20%"
            left="50%"
            transform="translate(-50%, -50%)"
            // zIndex={2}
            width="80%"
            maxWidth="800px"
            // round the ed
          >
            <CardBody py={8}>
              <VStack spacing={6}>
                <InputGroup
                  bg={cardBg}
                  size="lg"
                  transition="all 0.2s"
                  transform={searchTerm ? "scale(1.02)" : "scale(1)"}
                  borderRadius="full"
                  overflow="hidden"
                >
                  <InputLeftElement 
                    pointerEvents='none'
                    transition="all 0.3s"
                    transform={isFocused ? "translateX(-4px)" : "translateX(0)"}
                    h="100%"
                  >
                    <Icon as={FaNotesMedical} color="gray.400" boxSize={5} />
                  </InputLeftElement>
                  <Input
                    placeholder="Enter your symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    borderColor="brand.200"
                    height="60px"
                    fontSize="lg"
                    _hover={{ 
                      borderColor: "brand.300",
                      transform: "scale(1.01)",
                      boxShadow: "0 0 8px rgba(128, 90, 213, 0.2)"
                    }}
                    _focus={{ 
                      borderColor: "brand.500",
                      boxShadow: "0 0 12px rgba(128, 90, 213, 0.3)",
                      transform: "scale(1.02)"
                    }}
                    transition="all 0.2s"
                  />
                  <InputRightElement h="100%" pr={2}>
                    <IconButton
                      aria-label="Voice search"
                      icon={<FaMicrophone />}
                      variant="ghost"
                      colorScheme="brand"
                      size="lg"
                      onClick={handleVoiceSearch}
                      _hover={{
                        bg: 'brand.50',
                        transform: 'scale(1.1)',
                      }}
                      transition="all 0.2s"
                    />
                  </InputRightElement>
                </InputGroup>
              </VStack>
            </CardBody>
          </Card>

          {/* Map Container */}
          <Card 
            variant="elevated" 
            bg="transparent"  // Changed from cardBg to transparent
            marginTop={"80vh"} 
            borderWidth="0px"  // Ensure border is removed
            boxShadow="none"   // Remove any shadow
          >
            <CardBody p={4}>
              {!useCurrentLocation && (
                <Box
                  borderWidth="0px"
                  shadow="none"
                  position="absolute"
                  left="50%"
                  top="50%"
                  transform="translate(-50%, -50%)"
                  width="40px"
                  height="40px"
                  zIndex={1}
                  backgroundImage="url(http://maps.google.com/mapfiles/ms/icons/green-dot.png)"
                  backgroundSize="contain"
                  backgroundRepeat="no-repeat"
                  pointerEvents="none"
                />
              )}
              
              <Box
                bg={cardBg}
                borderRadius="lg"
                overflow="hidden"
                borderWidth="0px"
                borderColor="transparent"
                _hover={{
                  borderColor: "transparent",
                  boxShadow: "none",
                  transition: "all 0.2s"
                }}
              >
                <GoogleMap 
                  mapContainerStyle={containerStyle} 
                  center={center} 
                  zoom={10}
                  onLoad={map => {
                    mapRef.current = map;
                  }}
                  onCenterChanged={handleCenterChanged}
                  onClick={(e) => {
                    // Prevent any click events if clicking on InfoWindow
                    if (e.domEvent?.target?.closest('.gm-style-iw')) {
                      return;
                    }
                    setHoveredHospital(null);
                  }}
                  options={{
                    disableDoubleClickZoom: true,
                    clickableIcons: false
                  }}
                >
                  {/* User location blue marker (only when using current location) */}
                  {userLocation && useCurrentLocation && (
                    <Marker
                      position={userLocation}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                      title="Your Location"
                    />
                  )}

                  {nearestHospitals.map((hospital, index) => {
                    if (!hospital) {
                      console.warn(`Hospital at index ${index} is undefined or null`);
                      return null;
                    }

                    // Use lowercase field names to match backend
                    const name = hospital.name || 'Unknown Hospital';
                    const address = hospital.address || 'Address not available';
                    const lat = parseFloat(hospital.latitude);
                    const lng = parseFloat(hospital.longitude);
                    
                    if (isNaN(lat) || isNaN(lng)) {
                      console.warn(`Invalid coordinates for hospital: ${name}`);
                      return null;
                    }

                    return (
                      <Marker
                        key={index}
                        position={new window.google.maps.LatLng(lat, lng)}
                        title={name}
                        onClick={(() => {
                          return (e) => {
                            // Prevent the default behavior
                            e.stop();
                            if (e.domEvent) {
                              e.domEvent.stopPropagation();
                              e.domEvent.preventDefault();
                            }
                            
                            // Set the hovered hospital
                            setHoveredHospital({
                              ...hospital,
                              name,
                              address
                            });
                          };
                        })()}
                        options={{
                          clickable: true,
                          zIndex: 1000 // Ensure marker is clickable
                        }}
                      />
                    );
                  })}

                  {hoveredHospital && (
                    <InfoWindow
                      position={new window.google.maps.LatLng(
                        parseFloat(hoveredHospital.latitude),
                        parseFloat(hoveredHospital.longitude)
                      )}
                      onCloseClick={() => setHoveredHospital(null)}
                      options={{
                        pixelOffset: new window.google.maps.Size(0, -30),
                        maxWidth: 200,
                        zIndex: 1001,
                        clickable: true
                      }}
                      onClick={(e) => {
                        e.domEvent?.stopPropagation();
                        e.stop?.();
                      }}
                    >
                      <div 
                        style={{ padding: '5px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                        }}
                      >
                        <h4 style={{ fontWeight: 'bold', marginBottom: '5px' }}>{hoveredHospital.name}</h4>
                        <p style={{ marginBottom: '5px' }}>{hoveredHospital.address}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetDirections(hoveredHospital);
                          }}
                          style={{
                            marginTop: '5px',
                            padding: '5px 10px',
                            cursor: 'pointer'
                          }}
                        >
                          Get Directions
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </Box>
              {/* Updated controls layout */}
              <Flex width="100%" gap={6} align="center" marginTop={"4vh"}>
                  {/* <Box flex="1">
                    <Text mb={2}>Number of hospitals: {hospitalCount}</Text>
                    <Slider
                      aria-label='hospital-count-slider'
                      min={0}
                      max={50}
                      step={1}
                      value={hospitalCount}
                      onChange={setHospitalCount}
                      colorScheme="brand"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb 
                        boxSize={6} 
                        bg="white"
                        borderWidth="2px"
                        borderColor="brand.500"
                        boxShadow="0 0 5px rgba(128, 90, 213, 0.3)"
                      />
                    </Slider>
                  </Box> */}

<Center width="100%" justifyContent="center">
                    <HStack spacing={4}>
                      <Checkbox
                        isChecked={useCurrentLocation}
                        onChange={(e) => setUseCurrentLocation(e.target.checked)}
                        colorScheme="brand.secondary"
                        color="gray.600"
                        size="lg"
                        borderColor="gray.500"
                      >
                        Use my location
                      </Checkbox>

                      {!useCurrentLocation && (
                        <Button
                          colorScheme="brand"
                          onClick={handleFindNearby}
                          size="lg"
                          variant="outline"
                          borderColor="transparent"
                          fontWeight="normal"
                          leftIcon={<Icon as={FaSearch} boxSize={4} />}
                          px={8}
                        >
                          Find Nearby
                        </Button>
                      )}
                    </HStack>
                  </Center>
                </Flex>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      <Modal isOpen={isRecording} onClose={() => handleVoiceSearch()} isCentered>
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px)"
        />
        <ModalContent
          bg={cardBg}
          borderRadius="xl"
          boxShadow="xl"
          maxW="400px"
          p={6}
        >
          <ModalBody>
            <VStack spacing={6}>
              <Heading size="md">Recording...</Heading>
              <Text fontSize="4xl" fontWeight="bold">
                {recordingTime}s
              </Text>
              <Progress
                value={(recordingTime / 120) * 100}
                size="sm"
                width="100%"
                colorScheme="brand"
                borderRadius="full"
              />
              <Button
                colorScheme="brand"
                onClick={() => handleVoiceSearch()}
                size="lg"
                width="100%"
                borderRadius="full"
              >
                Stop Recording
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  ) : (
    <Container maxW="container.xl" py={2}>
      <Text>Loading map...</Text>
    </Container>
  );
}

export default MapDashboard;