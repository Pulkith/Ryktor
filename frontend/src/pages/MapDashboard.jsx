import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
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
} from '@chakra-ui/react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';

const containerStyle = {
  width: '100%',
  height: '65vh',
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
  const [hospitalCount, setHospitalCount] = useState(0);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [mapCenter, setMapCenter] = useState(center);  // Add this state for visual center

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

  return isLoaded ? (
    <Container 
      maxW="container.xl" 
      py={8}
      height="calc(100vh - 60px)" 
      display="flex" 
      flexDirection="column"
    >
      <VStack spacing={6} align="stretch">
        {/* Location Controls Group */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <InputGroup
                transition="all 0.2s"
                transform={searchTerm ? "scale(1.02)" : "scale(1)"}
              >
                <InputLeftElement 
                  pointerEvents='none'
                  transition="all 0.3s"
                  transform={isFocused ? "translateX(-4px)" : "translateX(0)"}
                >
                </InputLeftElement>
                <Input
                  placeholder="Enter search term..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  borderColor="brand.200"
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
              </InputGroup>

              <Box width="100%" px={4}>
                <Text mb={2}>Number of hospitals to display: {hospitalCount}</Text>
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
              </Box>
              <Flex px={4} align="left" gap={4}>
                <Checkbox
                  isChecked={useCurrentLocation}
                  onChange={(e) => setUseCurrentLocation(e.target.checked)}
                  colorScheme="brand"
                  size="md"
                  alignSelf="flex-start"
                >
                  Use my current location
                </Checkbox>

                {!useCurrentLocation && (
                  <Button
                    colorScheme="brand"
                    onClick={handleFindNearby}
                    size="md"
                    flexShrink={0}
                  >
                    Find Nearby Hospitals
                  </Button>
                )}
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Map Container */}
        <Card variant="elevated" bg={cardBg}>
          <CardBody p={4}>
            {!useCurrentLocation && (
              <Box
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
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{
                borderColor: hoverBorderColor,
                boxShadow: "lg",
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
          </CardBody>
        </Card>
      </VStack>
    </Container>
  ) : (
    <Container maxW="container.xl" py={2}>
      <Text>Loading map...</Text>
    </Container>
  );
}

export default MapDashboard;