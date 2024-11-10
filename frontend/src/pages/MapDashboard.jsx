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
  }, [center, hospitalCount, searchTerm, toast]);

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
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          shadow="sm"
        >
          <Flex px={4} align="left"  gap={4}>
            <Checkbox
              isChecked={useCurrentLocation}
              onChange={(e) => setUseCurrentLocation(e.target.checked)}
              colorScheme="purple"
              size="md"
            >
              Use my current location
            </Checkbox>

            {!useCurrentLocation && (
              <Button
                colorScheme="purple"
                onClick={handleFindNearby}
                size="md"
                flexShrink={0}
              >
                Find Nearby Hospitals
              </Button>
            )}
          </Flex>

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
              borderColor="purple.200"
              _hover={{ 
                borderColor: "purple.300",
                transform: "scale(1.01)",
                boxShadow: "0 0 8px rgba(128, 90, 213, 0.2)"
              }}
              _focus={{ 
                borderColor: "purple.500",
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
              colorScheme="purple"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb 
                boxSize={6} 
                bg="white"
                borderWidth="2px"
                borderColor="purple.500"
                boxShadow="0 0 5px rgba(128, 90, 213, 0.3)"
              />
            </Slider>
          </Box>
        </Box>

        {/* Map Container */}
        <Box
          bg="white"
          p={4}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          shadow="sm"
        >
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
          
          <GoogleMap 
            mapContainerStyle={containerStyle} 
            center={center} 
            zoom={10}
            onLoad={map => {
              mapRef.current = map;
            }}
            onCenterChanged={handleCenterChanged}
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
              // Skip if hospital object is undefined or null
              if (!hospital) {
                console.warn(`Hospital at index ${index} is undefined or null`);
                return null;
              }
              // Ensure required properties exist
              const name = hospital.NAME || 'Unknown Hospital';
              const address = hospital.ADDRESS || 'Address not available';
              const telephone = hospital.TELEPHONE || 'Phone not available';
              
              // Debug log for each hospital
              console.log(`Processing hospital ${index}:`, {
                name,
                lat: hospital.LATITUDE,
                lng: hospital.LONGITUDE
              });

              return (
                <Marker
                  key={index}
                  position={new window.google.maps.LatLng(
                    parseFloat(hospital.LATITUDE),
                    parseFloat(hospital.LONGITUDE)
                  )}
                  title={name}
                  onClick={(e) => {
                    e.domEvent.stopPropagation();
                    setHoveredHospital({
                      ...hospital,
                      NAME: name,
                      ADDRESS: address,
                      TELEPHONE: telephone
                    });
                  }}
                  options={{
                    clickable: true
                  }}
                />
              );
            })}
            {hoveredHospital && (
              <InfoWindow
                position={{ 
                  lat: parseFloat(hoveredHospital.LATITUDE), 
                  lng: parseFloat(hoveredHospital.LONGITUDE) 
                }}
                onCloseClick={() => setHoveredHospital(null)}
              >
                <div>
                  <h4>{hoveredHospital.NAME}</h4>
                  <p>{hoveredHospital.ADDRESS}</p>
                  <p>{hoveredHospital.TELEPHONE}</p>
                  <button onClick={() => handleGetDirections(hoveredHospital)}>
                    Get Directions
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </Box>
      </VStack>
    </Container>
  ) : (
    <Container maxW="container.xl" py={2}>
      <Text>Loading map...</Text>
    </Container>
  );
}

export default MapDashboard;