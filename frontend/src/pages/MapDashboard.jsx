import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Accordion,
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
  Spinner,
} from '@chakra-ui/react';
// import { Accordion, AccordionItem } from '@szhsin/react-accordion';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@chakra-ui/react';
import { FaNotesMedical } from 'react-icons/fa'; // or another medical-themed icon

import { FaSearch, FaMicrophone } from 'react-icons/fa';

import { transcribeAudio } from '../services/audioService';



const json_dt = {
  "LBJ TROPICAL MEDICAL CENTER": {
      "treatments": [
          {
              "CPT Code": "99213",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 15-29 minutes.",
              "Probability": 0.9,
              "Category": "General_Practice",
              "varianced_cost_total": 82.43972530368731,
              "varianced_cost_copay": 16.487945060737463
          },
          {
              "CPT Code": "99214",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 30-39 minutes.",
              "Probability": 0.5,
              "Category": "General_Practice",
              "varianced_cost_total": 84.85041771858096,
              "varianced_cost_copay": 16.970083543716193
          },
          {
              "CPT Code": "93000",
              "Service Name": "Electrocardiogram (ECG or EKG)",
              "Description": "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report.",
              "Probability": 0.1,
              "Category": "Cardiology",
              "varianced_cost_total": 19.750853248186832,
              "varianced_cost_copay": 3.9501706496373665
          },
          {
              "CPT Code": "70450",
              "Service Name": "CT Scan of Head or Brain",
              "Description": "CT scan of the head or brain without contrast material.",
              "Probability": 0.2,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 142.6696465080307,
              "varianced_cost_copay": 28.533929301606136
          },
          {
              "CPT Code": "70460",
              "Service Name": "CT Scan of Head or Brain with Contrast",
              "Description": "CT scan of the head or brain with contrast material.",
              "Probability": 0.05,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 170.8636143903241,
              "varianced_cost_copay": 34.17272287806481
          },
          {
              "CPT Code": "99203",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 30-44 minutes.",
              "Probability": 0.1,
              "Category": "General_Practice",
              "varianced_cost_total": 86.43844382100737,
              "varianced_cost_copay": 17.287688764201473
          },
          {
              "CPT Code": "36415",
              "Service Name": "Collection of Venous Blood Sample",
              "Description": "Collection of venous blood by venipuncture.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 510.45760222916107,
              "varianced_cost_copay": 102.09152044583222
          },
          {
              "CPT Code": "85025",
              "Service Name": "Complete Blood Count (CBC) with Differential",
              "Description": "Complete blood count with differential white blood cell count.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 494.90877124672477,
              "varianced_cost_copay": 98.98175424934496
          },
          {
              "CPT Code": "99212",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 10-19 minutes.",
              "Probability": 0.2,
              "Category": "General_Practice",
              "varianced_cost_total": 52.64306461245534,
              "varianced_cost_copay": 10.528612922491067
          },
          {
              "CPT Code": "99205",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 45-59 minutes.",
              "Probability": 0.01,
              "Category": "General_Practice",
              "varianced_cost_total": 159.85404269636197,
              "varianced_cost_copay": 31.97080853927239
          }
      ],
      "X": -19000649.7737926,
      "Y": -1607536.44242472,
      "OBJECTID": 8383,
      "ID": 396799,
      "NAME": "LBJ TROPICAL MEDICAL CENTER",
      "ADDRESS": "FAGAALU VILLAGE, PO BOX LBJ",
      "CITY": "PAGO PAGO",
      "STATE": "AS",
      "ZIP": "96799",
      "ZIP4": "NOT AVAILABLE",
      "TELEPHONE": "(684) 633-4590",
      "TYPE": "GENERAL ACUTE CARE",
      "STATUS": "OPEN",
      "POPULATION": 150,
      "COUNTY": "EASTERN",
      "COUNTYFIPS": 60010,
      "COUNTRY": "ASM",
      "LATITUDE": -14.290242,
      "LONGITUDE": -170.685741,
      "NAICS_CODE": 622110,
      "NAICS_DESC": "GENERAL MEDICAL AND SURGICAL HOSPITALS",
      "SOURCE": "https://data.cms.gov/provider-data/search?page=4&theme=Hospitals",
      "SOURCEDATE": "2024/04/12 00:00:00+00",
      "VAL_METHOD": "IMAGERY/OTHER",
      "VAL_DATE": "2014/04/03 00:00:00+00",
      "WEBSITE": "NOT AVAILABLE",
      "STATE_ID": "NOT AVAILABLE",
      "ALT_NAME": "NOT AVAILABLE",
      "ST_FIPS": "60",
      "OWNER": "GOVERNMENT - DISTRICT/AUTHORITY",
      "TTL_STAFF": -999,
      "BEDS": 150,
      "TRAUMA": "NOT AVAILABLE",
      "HELIPAD": "N",
      "Distance": 9844.635152110093,
      "total_cost_overall": 478.05406675287117,
      "total_cost_copay": 95.61081335057425
  },
  "BELAU NATIONAL HOSPITAL": {
      "treatments": [
          {
              "CPT Code": "99213",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 15-29 minutes.",
              "Probability": 0.9,
              "Category": "General_Practice",
              "varianced_cost_total": 82.43972530368731,
              "varianced_cost_copay": 16.487945060737463
          },
          {
              "CPT Code": "99214",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 30-39 minutes.",
              "Probability": 0.5,
              "Category": "General_Practice",
              "varianced_cost_total": 84.85041771858096,
              "varianced_cost_copay": 16.970083543716193
          },
          {
              "CPT Code": "93000",
              "Service Name": "Electrocardiogram (ECG or EKG)",
              "Description": "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report.",
              "Probability": 0.1,
              "Category": "Cardiology",
              "varianced_cost_total": 19.750853248186832,
              "varianced_cost_copay": 3.9501706496373665
          },
          {
              "CPT Code": "70450",
              "Service Name": "CT Scan of Head or Brain",
              "Description": "CT scan of the head or brain without contrast material.",
              "Probability": 0.2,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 142.6696465080307,
              "varianced_cost_copay": 28.533929301606136
          },
          {
              "CPT Code": "70460",
              "Service Name": "CT Scan of Head or Brain with Contrast",
              "Description": "CT scan of the head or brain with contrast material.",
              "Probability": 0.05,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 170.8636143903241,
              "varianced_cost_copay": 34.17272287806481
          },
          {
              "CPT Code": "99203",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 30-44 minutes.",
              "Probability": 0.1,
              "Category": "General_Practice",
              "varianced_cost_total": 86.43844382100737,
              "varianced_cost_copay": 17.287688764201473
          },
          {
              "CPT Code": "36415",
              "Service Name": "Collection of Venous Blood Sample",
              "Description": "Collection of venous blood by venipuncture.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 510.45760222916107,
              "varianced_cost_copay": 102.09152044583222
          },
          {
              "CPT Code": "85025",
              "Service Name": "Complete Blood Count (CBC) with Differential",
              "Description": "Complete blood count with differential white blood cell count.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 494.90877124672477,
              "varianced_cost_copay": 98.98175424934496
          },
          {
              "CPT Code": "99212",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 10-19 minutes.",
              "Probability": 0.2,
              "Category": "General_Practice",
              "varianced_cost_total": 52.64306461245534,
              "varianced_cost_copay": 10.528612922491067
          },
          {
              "CPT Code": "99205",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 45-59 minutes.",
              "Probability": 0.01,
              "Category": "General_Practice",
              "varianced_cost_total": 159.85404269636197,
              "varianced_cost_copay": 31.97080853927239
          }
      ],
      "X": 14968479.0648747,
      "Y": 820922.833465995,
      "OBJECTID": 13191,
      "ID": 696940,
      "NAME": "BELAU NATIONAL HOSPITAL",
      "ADDRESS": "1 HOSPITAL ROAD",
      "CITY": "KOROR",
      "STATE": "PW",
      "ZIP": "96940",
      "ZIP4": "NOT AVAILABLE",
      "TELEPHONE": "(680) 488-2552",
      "TYPE": "GENERAL ACUTE CARE",
      "STATUS": "OPEN",
      "POPULATION": 80,
      "COUNTY": "KOROR",
      "COUNTYFIPS": 70150,
      "COUNTRY": "PLW",
      "LATITUDE": 7.35419831000007,
      "LONGITUDE": 134.46413524,
      "NAICS_CODE": 622110,
      "NAICS_DESC": "GENERAL MEDICAL AND SURGICAL HOSPITALS",
      "SOURCE": "https://www.palauhealth.org/MOHpages/MOHContactUs1.aspx",
      "SOURCEDATE": "2023/05/11 00:00:00+00",
      "VAL_METHOD": "IMAGERY/OTHER",
      "VAL_DATE": "2014/04/03 00:00:00+00",
      "WEBSITE": "NOT AVAILABLE",
      "STATE_ID": "NOT AVAILABLE",
      "ALT_NAME": "NOT AVAILABLE",
      "ST_FIPS": " ",
      "OWNER": "GOVERNMENT - LOCAL",
      "TTL_STAFF": -999,
      "BEDS": 80,
      "TRAUMA": "NOT AVAILABLE",
      "HELIPAD": "N",
      "Distance": 10926.235678404328,
      "total_cost_overall": 478.05406675287117,
      "total_cost_copay": 95.61081335057425
  },
  "NAVAL HOSPITAL GUAM": {
      "treatments": [
          {
              "CPT Code": "99213",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 15-29 minutes.",
              "Probability": 0.9,
              "Category": "General_Practice",
              "varianced_cost_total": 82.43972530368731,
              "varianced_cost_copay": 16.487945060737463
          },
          {
              "CPT Code": "99214",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 30-39 minutes.",
              "Probability": 0.5,
              "Category": "General_Practice",
              "varianced_cost_total": 84.85041771858096,
              "varianced_cost_copay": 16.970083543716193
          },
          {
              "CPT Code": "93000",
              "Service Name": "Electrocardiogram (ECG or EKG)",
              "Description": "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report.",
              "Probability": 0.1,
              "Category": "Cardiology",
              "varianced_cost_total": 19.750853248186832,
              "varianced_cost_copay": 3.9501706496373665
          },
          {
              "CPT Code": "70450",
              "Service Name": "CT Scan of Head or Brain",
              "Description": "CT scan of the head or brain without contrast material.",
              "Probability": 0.2,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 142.6696465080307,
              "varianced_cost_copay": 28.533929301606136
          },
          {
              "CPT Code": "70460",
              "Service Name": "CT Scan of Head or Brain with Contrast",
              "Description": "CT scan of the head or brain with contrast material.",
              "Probability": 0.05,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 170.8636143903241,
              "varianced_cost_copay": 34.17272287806481
          },
          {
              "CPT Code": "99203",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 30-44 minutes.",
              "Probability": 0.1,
              "Category": "General_Practice",
              "varianced_cost_total": 86.43844382100737,
              "varianced_cost_copay": 17.287688764201473
          },
          {
              "CPT Code": "36415",
              "Service Name": "Collection of Venous Blood Sample",
              "Description": "Collection of venous blood by venipuncture.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 510.45760222916107,
              "varianced_cost_copay": 102.09152044583222
          },
          {
              "CPT Code": "85025",
              "Service Name": "Complete Blood Count (CBC) with Differential",
              "Description": "Complete blood count with differential white blood cell count.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 494.90877124672477,
              "varianced_cost_copay": 98.98175424934496
          },
          {
              "CPT Code": "99212",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 10-19 minutes.",
              "Probability": 0.2,
              "Category": "General_Practice",
              "varianced_cost_total": 52.64306461245534,
              "varianced_cost_copay": 10.528612922491067
          },
          {
              "CPT Code": "99205",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 45-59 minutes.",
              "Probability": 0.01,
              "Category": "General_Practice",
              "varianced_cost_total": 159.85404269636197,
              "varianced_cost_copay": 31.97080853927239
          }
      ],
      "X": 16112005.9247197,
      "Y": 1514076.60194413,
      "OBJECTID": 15998,
      "ID": 182096919,
      "NAME": "NAVAL HOSPITAL GUAM",
      "ADDRESS": "FARENHOLT AVE., BLDG 50",
      "CITY": "AGANA HEIGHTS",
      "STATE": "GU",
      "ZIP": "96919",
      "ZIP4": "NOT AVAILABLE",
      "TELEPHONE": "(671) 344-9242",
      "TYPE": "MILITARY",
      "STATUS": "OPEN",
      "POPULATION": -999,
      "COUNTY": "GUAM",
      "COUNTYFIPS": 66010,
      "COUNTRY": "GUM",
      "LATITUDE": 13.4752103000001,
      "LONGITUDE": 144.7366118,
      "NAICS_CODE": 622110,
      "NAICS_DESC": "GENERAL MEDICAL AND SURGICAL HOSPITALS",
      "SOURCE": "http://www.tricare.mil/mtf",
      "SOURCEDATE": "2024/04/22 00:00:00+00",
      "VAL_METHOD": "IMAGERY/OTHER",
      "VAL_DATE": "2022/04/07 00:00:00+00",
      "WEBSITE": "NOT AVAILABLE",
      "STATE_ID": "NOT AVAILABLE",
      "ALT_NAME": "NOT AVAILABLE",
      "ST_FIPS": "66",
      "OWNER": "GOVERNMENT - FEDERAL",
      "TTL_STAFF": -999,
      "BEDS": -999,
      "TRAUMA": "NOT AVAILABLE",
      "HELIPAD": "Y",
      "Distance": 11873.487886628223,
      "total_cost_overall": 478.05406675287117,
      "total_cost_copay": 95.61081335057425
  },
  "GUAM MEMORIAL HOSPITAL AUTHORITY": {
      "treatments": [
          {
              "CPT Code": "99213",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 15-29 minutes.",
              "Probability": 0.9,
              "Category": "General_Practice",
              "varianced_cost_total": 82.43972530368731,
              "varianced_cost_copay": 16.487945060737463
          },
          {
              "CPT Code": "99214",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 30-39 minutes.",
              "Probability": 0.5,
              "Category": "General_Practice",
              "varianced_cost_total": 84.85041771858096,
              "varianced_cost_copay": 16.970083543716193
          },
          {
              "CPT Code": "93000",
              "Service Name": "Electrocardiogram (ECG or EKG)",
              "Description": "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report.",
              "Probability": 0.1,
              "Category": "Cardiology",
              "varianced_cost_total": 19.750853248186832,
              "varianced_cost_copay": 3.9501706496373665
          },
          {
              "CPT Code": "70450",
              "Service Name": "CT Scan of Head or Brain",
              "Description": "CT scan of the head or brain without contrast material.",
              "Probability": 0.2,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 142.6696465080307,
              "varianced_cost_copay": 28.533929301606136
          },
          {
              "CPT Code": "70460",
              "Service Name": "CT Scan of Head or Brain with Contrast",
              "Description": "CT scan of the head or brain with contrast material.",
              "Probability": 0.05,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 170.8636143903241,
              "varianced_cost_copay": 34.17272287806481
          },
          {
              "CPT Code": "99203",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 30-44 minutes.",
              "Probability": 0.1,
              "Category": "General_Practice",
              "varianced_cost_total": 86.43844382100737,
              "varianced_cost_copay": 17.287688764201473
          },
          {
              "CPT Code": "36415",
              "Service Name": "Collection of Venous Blood Sample",
              "Description": "Collection of venous blood by venipuncture.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 510.45760222916107,
              "varianced_cost_copay": 102.09152044583222
          },
          {
              "CPT Code": "85025",
              "Service Name": "Complete Blood Count (CBC) with Differential",
              "Description": "Complete blood count with differential white blood cell count.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 494.90877124672477,
              "varianced_cost_copay": 98.98175424934496
          },
          {
              "CPT Code": "99212",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 10-19 minutes.",
              "Probability": 0.2,
              "Category": "General_Practice",
              "varianced_cost_total": 52.64306461245534,
              "varianced_cost_copay": 10.528612922491067
          },
          {
              "CPT Code": "99205",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 45-59 minutes.",
              "Probability": 0.01,
              "Category": "General_Practice",
              "varianced_cost_total": 159.85404269636197,
              "varianced_cost_copay": 31.97080853927239
          }
      ],
      "X": 16116219.2783907,
      "Y": 1517481.59830073,
      "OBJECTID": 9962,
      "ID": 496913,
      "NAME": "GUAM MEMORIAL HOSPITAL AUTHORITY",
      "ADDRESS": "85O GOV CARLOS G CAMACHO ROAD",
      "CITY": "TAMUNING",
      "STATE": "GU",
      "ZIP": "96913",
      "ZIP4": "NOT AVAILABLE",
      "TELEPHONE": "(671) 647-2552",
      "TYPE": "GENERAL ACUTE CARE",
      "STATUS": "OPEN",
      "POPULATION": 158,
      "COUNTY": "GUAM",
      "COUNTYFIPS": 66010,
      "COUNTRY": "GUM",
      "LATITUDE": 13.5049540000001,
      "LONGITUDE": 144.774461,
      "NAICS_CODE": 622110,
      "NAICS_DESC": "GENERAL MEDICAL AND SURGICAL HOSPITALS",
      "SOURCE": "https://data.cms.gov/provider-data/search?page=4&theme=Hospitals",
      "SOURCEDATE": "2024/04/12 00:00:00+00",
      "VAL_METHOD": "IMAGERY/OTHER",
      "VAL_DATE": "2018/04/06 00:00:00+00",
      "WEBSITE": "http://www.gmha.org/gmha_new/",
      "STATE_ID": "650001",
      "ALT_NAME": "NOT AVAILABLE",
      "ST_FIPS": "66",
      "OWNER": "GOVERNMENT - LOCAL",
      "TTL_STAFF": -999,
      "BEDS": 158,
      "TRAUMA": "NOT AVAILABLE",
      "HELIPAD": "N",
      "Distance": 11877.73936753569,
      "total_cost_overall": 478.05406675287117,
      "total_cost_copay": 95.61081335057425
  },
  "GUAM REGIONAL MEDICAL CITY": {
      "treatments": [
          {
              "CPT Code": "99213",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 15-29 minutes.",
              "Probability": 0.9,
              "Category": "General_Practice",
              "varianced_cost_total": 82.43972530368731,
              "varianced_cost_copay": 16.487945060737463
          },
          {
              "CPT Code": "99214",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 30-39 minutes.",
              "Probability": 0.5,
              "Category": "General_Practice",
              "varianced_cost_total": 84.85041771858096,
              "varianced_cost_copay": 16.970083543716193
          },
          {
              "CPT Code": "93000",
              "Service Name": "Electrocardiogram (ECG or EKG)",
              "Description": "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report.",
              "Probability": 0.1,
              "Category": "Cardiology",
              "varianced_cost_total": 19.750853248186832,
              "varianced_cost_copay": 3.9501706496373665
          },
          {
              "CPT Code": "70450",
              "Service Name": "CT Scan of Head or Brain",
              "Description": "CT scan of the head or brain without contrast material.",
              "Probability": 0.2,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 142.6696465080307,
              "varianced_cost_copay": 28.533929301606136
          },
          {
              "CPT Code": "70460",
              "Service Name": "CT Scan of Head or Brain with Contrast",
              "Description": "CT scan of the head or brain with contrast material.",
              "Probability": 0.05,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 170.8636143903241,
              "varianced_cost_copay": 34.17272287806481
          },
          {
              "CPT Code": "99203",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 30-44 minutes.",
              "Probability": 0.1,
              "Category": "General_Practice",
              "varianced_cost_total": 86.43844382100737,
              "varianced_cost_copay": 17.287688764201473
          },
          {
              "CPT Code": "36415",
              "Service Name": "Collection of Venous Blood Sample",
              "Description": "Collection of venous blood by venipuncture.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 510.45760222916107,
              "varianced_cost_copay": 102.09152044583222
          },
          {
              "CPT Code": "85025",
              "Service Name": "Complete Blood Count (CBC) with Differential",
              "Description": "Complete blood count with differential white blood cell count.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 494.90877124672477,
              "varianced_cost_copay": 98.98175424934496
          },
          {
              "CPT Code": "99212",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 10-19 minutes.",
              "Probability": 0.2,
              "Category": "General_Practice",
              "varianced_cost_total": 52.64306461245534,
              "varianced_cost_copay": 10.528612922491067
          },
          {
              "CPT Code": "99205",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 45-59 minutes.",
              "Probability": 0.01,
              "Category": "General_Practice",
              "varianced_cost_total": 159.85404269636197,
              "varianced_cost_copay": 31.97080853927239
          }
      ],
      "X": 16121631.0754356,
      "Y": 1519791.88953132,
      "OBJECTID": 9963,
      "ID": 180696929,
      "NAME": "GUAM REGIONAL MEDICAL CITY",
      "ADDRESS": "133 ROUTE 3",
      "CITY": "DEDEDO",
      "STATE": "GU",
      "ZIP": "96929",
      "ZIP4": "NOT AVAILABLE",
      "TELEPHONE": "(671) 645-5500",
      "TYPE": "GENERAL ACUTE CARE",
      "STATUS": "OPEN",
      "POPULATION": 136,
      "COUNTY": "GUAM",
      "COUNTYFIPS": 66010,
      "COUNTRY": "GUM",
      "LATITUDE": 13.525133,
      "LONGITUDE": 144.823076,
      "NAICS_CODE": 622110,
      "NAICS_DESC": "GENERAL MEDICAL AND SURGICAL HOSPITALS",
      "SOURCE": "https://data.cms.gov/provider-data/search?page=4&theme=Hospitals",
      "SOURCEDATE": "2024/04/12 00:00:00+00",
      "VAL_METHOD": "IMAGERY",
      "VAL_DATE": "2019/05/09 00:00:00+00",
      "WEBSITE": "http://www.grmc.gu/",
      "STATE_ID": "650003",
      "ALT_NAME": "NOT AVAILABLE",
      "ST_FIPS": "66",
      "OWNER": "NON-PROFIT",
      "TTL_STAFF": -999,
      "BEDS": 136,
      "TRAUMA": "NOT AVAILABLE",
      "HELIPAD": "N",
      "Distance": 11881.263584303024,
      "total_cost_overall": 478.05406675287117,
      "total_cost_copay": 95.61081335057425
  },
  "COMMONWEALTH HEALTH CENTER": {
      "treatments": [
          {
              "CPT Code": "99213",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 15-29 minutes.",
              "Probability": 0.9,
              "Category": "General_Practice",
              "varianced_cost_total": 82.43972530368731,
              "varianced_cost_copay": 16.487945060737463
          },
          {
              "CPT Code": "99214",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 30-39 minutes.",
              "Probability": 0.5,
              "Category": "General_Practice",
              "varianced_cost_total": 84.85041771858096,
              "varianced_cost_copay": 16.970083543716193
          },
          {
              "CPT Code": "93000",
              "Service Name": "Electrocardiogram (ECG or EKG)",
              "Description": "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report.",
              "Probability": 0.1,
              "Category": "Cardiology",
              "varianced_cost_total": 19.750853248186832,
              "varianced_cost_copay": 3.9501706496373665
          },
          {
              "CPT Code": "70450",
              "Service Name": "CT Scan of Head or Brain",
              "Description": "CT scan of the head or brain without contrast material.",
              "Probability": 0.2,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 142.6696465080307,
              "varianced_cost_copay": 28.533929301606136
          },
          {
              "CPT Code": "70460",
              "Service Name": "CT Scan of Head or Brain with Contrast",
              "Description": "CT scan of the head or brain with contrast material.",
              "Probability": 0.05,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 170.8636143903241,
              "varianced_cost_copay": 34.17272287806481
          },
          {
              "CPT Code": "99203",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 30-44 minutes.",
              "Probability": 0.1,
              "Category": "General_Practice",
              "varianced_cost_total": 86.43844382100737,
              "varianced_cost_copay": 17.287688764201473
          },
          {
              "CPT Code": "36415",
              "Service Name": "Collection of Venous Blood Sample",
              "Description": "Collection of venous blood by venipuncture.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 510.45760222916107,
              "varianced_cost_copay": 102.09152044583222
          },
          {
              "CPT Code": "85025",
              "Service Name": "Complete Blood Count (CBC) with Differential",
              "Description": "Complete blood count with differential white blood cell count.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 494.90877124672477,
              "varianced_cost_copay": 98.98175424934496
          },
          {
              "CPT Code": "99212",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 10-19 minutes.",
              "Probability": 0.2,
              "Category": "General_Practice",
              "varianced_cost_total": 52.64306461245534,
              "varianced_cost_copay": 10.528612922491067
          },
          {
              "CPT Code": "99205",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 45-59 minutes.",
              "Probability": 0.01,
              "Category": "General_Practice",
              "varianced_cost_total": 159.85404269636197,
              "varianced_cost_copay": 31.97080853927239
          }
      ],
      "X": 16221974.0625733,
      "Y": 1713602.38387751,
      "OBJECTID": 12705,
      "ID": 596950,
      "NAME": "COMMONWEALTH HEALTH CENTER",
      "ADDRESS": "1 LOWER NAVY HILL ROAD, PO BOX 409CK",
      "CITY": "GARAPAN",
      "STATE": "MP",
      "ZIP": "96950",
      "ZIP4": "NOT AVAILABLE",
      "TELEPHONE": "(670) 234-8950",
      "TYPE": "GENERAL ACUTE CARE",
      "STATUS": "OPEN",
      "POPULATION": 86,
      "COUNTY": "SAIPAN",
      "COUNTYFIPS": 69110,
      "COUNTRY": "MNP",
      "LATITUDE": 15.2116344400001,
      "LONGITUDE": 145.72447239,
      "NAICS_CODE": 622110,
      "NAICS_DESC": "GENERAL MEDICAL AND SURGICAL HOSPITALS",
      "SOURCE": "https://data.cms.gov/provider-data/dataset/xubh-q36u",
      "SOURCEDATE": "2024/04/15 00:00:00+00",
      "VAL_METHOD": "IMAGERY/OTHER",
      "VAL_DATE": "2018/04/06 00:00:00+00",
      "WEBSITE": "https://chcc.gov.mp/",
      "STATE_ID": "NOT AVAILABLE",
      "ALT_NAME": "NOT AVAILABLE",
      "ST_FIPS": "69",
      "OWNER": "PROPRIETARY",
      "TTL_STAFF": -999,
      "BEDS": 86,
      "TRAUMA": "NOT AVAILABLE",
      "HELIPAD": "Y",
      "Distance": 12087.53354839062,
      "total_cost_overall": 478.05406675287117,
      "total_cost_copay": 95.61081335057425
  },
  "GOV JUAN F LUIS HOSPITAL AND MEDICAL CTR": {
      "treatments": [
          {
              "CPT Code": "99213",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 15-29 minutes.",
              "Probability": 0.9,
              "Category": "General_Practice",
              "varianced_cost_total": 82.43972530368731,
              "varianced_cost_copay": 16.487945060737463
          },
          {
              "CPT Code": "99214",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 30-39 minutes.",
              "Probability": 0.5,
              "Category": "General_Practice",
              "varianced_cost_total": 84.85041771858096,
              "varianced_cost_copay": 16.970083543716193
          },
          {
              "CPT Code": "93000",
              "Service Name": "Electrocardiogram (ECG or EKG)",
              "Description": "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report.",
              "Probability": 0.1,
              "Category": "Cardiology",
              "varianced_cost_total": 19.750853248186832,
              "varianced_cost_copay": 3.9501706496373665
          },
          {
              "CPT Code": "70450",
              "Service Name": "CT Scan of Head or Brain",
              "Description": "CT scan of the head or brain without contrast material.",
              "Probability": 0.2,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 142.6696465080307,
              "varianced_cost_copay": 28.533929301606136
          },
          {
              "CPT Code": "70460",
              "Service Name": "CT Scan of Head or Brain with Contrast",
              "Description": "CT scan of the head or brain with contrast material.",
              "Probability": 0.05,
              "Category": "Diagnostic_Radiology",
              "varianced_cost_total": 170.8636143903241,
              "varianced_cost_copay": 34.17272287806481
          },
          {
              "CPT Code": "99203",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 30-44 minutes.",
              "Probability": 0.1,
              "Category": "General_Practice",
              "varianced_cost_total": 86.43844382100737,
              "varianced_cost_copay": 17.287688764201473
          },
          {
              "CPT Code": "36415",
              "Service Name": "Collection of Venous Blood Sample",
              "Description": "Collection of venous blood by venipuncture.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 510.45760222916107,
              "varianced_cost_copay": 102.09152044583222
          },
          {
              "CPT Code": "85025",
              "Service Name": "Complete Blood Count (CBC) with Differential",
              "Description": "Complete blood count with differential white blood cell count.",
              "Probability": 0.3,
              "Category": "Clinical_Laboratory",
              "varianced_cost_total": 494.90877124672477,
              "varianced_cost_copay": 98.98175424934496
          },
          {
              "CPT Code": "99212",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "Established patient office visit, typically 10-19 minutes.",
              "Probability": 0.2,
              "Category": "General_Practice",
              "varianced_cost_total": 52.64306461245534,
              "varianced_cost_copay": 10.528612922491067
          },
          {
              "CPT Code": "99205",
              "Service Name": "Office or Other Outpatient Visit",
              "Description": "New patient office visit, typically 45-59 minutes.",
              "Probability": 0.01,
              "Category": "General_Practice",
              "varianced_cost_total": 159.85404269636197,
              "varianced_cost_copay": 31.97080853927239
          }
      ],
      "X": -7208101.55907185,
      "Y": 2006342.97802613,
      "OBJECTID": 14544,
      "ID": 200820,
      "NAME": "GOV JUAN F LUIS HOSPITAL AND MEDICAL CTR",
      "ADDRESS": "4007 EST DIAMOND RUBY, CHRISTIANSTED",
      "CITY": "ST CROIX",
      "STATE": "VI",
      "ZIP": "00820",
      "ZIP4": "NOT AVAILABLE",
      "TELEPHONE": "(340) 778-6311",
      "TYPE": "GENERAL ACUTE CARE",
      "STATUS": "OPEN",
      "POPULATION": 188,
      "COUNTY": "ST. CROIX",
      "COUNTYFIPS": 78010,
      "COUNTRY": "VIR",
      "LATITUDE": 17.733195,
      "LONGITUDE": -64.751478,
      "NAICS_CODE": 622110,
      "NAICS_DESC": "GENERAL MEDICAL AND SURGICAL HOSPITALS",
      "SOURCE": "https://data.cms.gov/provider-data/search?page=4&theme=Hospitals",
      "SOURCEDATE": "2024/04/22 00:00:00+00",
      "VAL_METHOD": "IMAGERY/OTHER",
      "VAL_DATE": "2018/04/06 00:00:00+00",
      "WEBSITE": "NOT AVAILABLE",
      "STATE_ID": "480002",
      "ALT_NAME": "NOT AVAILABLE",
      "ST_FIPS": "78",
      "OWNER": "GOVERNMENT - STATE",
      "TTL_STAFF": -999,
      "BEDS": 188,
      "TRAUMA": "NOT AVAILABLE",
      "HELIPAD": "N",
      "Distance": 12328.140876155563,
      "total_cost_overall": 478.05406675287117,
      "total_cost_copay": 95.61081335057425
  }
}
var json_lst = []

// convert json_dt into a list of objects
for (var key in json_dt) {
  json_lst.push(json_dt[key]);
}


const containerStyle = {
  width: '100%',
  height: '70vh',
};

function MapDashboard() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const { user } = useAuth();  // Get the user object from the AuthProvider

  const [center, setCenter] = useState({ lat: 39.95, lng: -75.1943 }); // Default center
  const [hoveredHospital, setHoveredHospital] = useState(null);
  
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for storing search input
  const [isFocused, setIsFocused] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitalCount, setHospitalCount] = useState(30);
  const [showActuals, setShowActuals] = useState(false);  // Add this state for showing actuals
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [mapCenter, setMapCenter] = useState(center);  // Add this state for visual center
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimerId, setRecordingTimerId] = useState(null);
  
  const [showTreatsModal, setShowTreatsModal] = useState(false);
  const [showTeatsHospital, setShowTeatsHospital] = useState({});

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

    if (!user) {
      navigate('/login');
      return;
    }

    return () => clearTimeout(timer);
  }, [hospitalCount]);

  const [status, setStatus] = useState('idle');
  const [statusTextIndex, setStatusTextIndex] = useState(0);

  const statusTexts = [
    'Uploading Data',
    'Crunching the Numbers',
    'Appyling for Med School',
    'Finding Possible Conditions',
    'Taking the MCAT',
    'Predicting Potential Treatments',
    'Failing the MCAT',
    'Analyzing Costs',
    'Checking Insurance Coverage',
    'Shadowing Dr.Grey',
    'Predicting Copay',
    'Finding Regional Deltas',
    'Eating my vegetables',
    'Checking Distance to Nearest Hospitals',
    'Checking Deductible',
    'Curing Cancer',
    'Finding Premiums',
    'Recommending Next Steps',
  ];
  const API_URL = "http://localhost:8002/api";
  const submitQuery = async () => {
    if(!searchTerm) {
      toast({
        title: 'Please enter a query',
        status: 'warning',
        duration: 5000,
      });
      return;
    }
    setStatus('loading');
    setStatusTextIndex(0);

    const timerId = setInterval(() => {
      setStatusTextIndex((prevIndex) => (prevIndex + 1) % statusTexts.length);
    }, 3000);

    const formData = new FormData();
    console.log(mapCenter)
    formData.append("user_id", user._id);
    formData.append("prompt", searchTerm);
    formData.append("long", mapCenter.lng);
    formData.append("lat", mapCenter.lat);

    await axios.post(`${API_URL}/illness/question`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then((response) => {
      console.log(response.data);
      setNearestHospitals(response.data);
      setShowActuals(true)
      setStatus('idle');
      clearInterval(timerId);

      
      const element = document.getElementById("mapmove");
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        console.warn(`Element with id "${id}" not found.`);
      }
    }).catch((error) => {
      console.error(error);
      setStatus('idle');
      clearInterval(timerId);
    });


  }

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

        // uppercase each key
        response.data.forEach((hospital) => {
          Object.keys(hospital).forEach((key) => {
            const newKey = key.toUpperCase();
            if (key !== newKey) {
              hospital[newKey] = hospital[key];
              delete hospital[key];
            }
          });
        });

        // console.log(response.data)
        setNearestHospitals(response.data);
        // setNearestHospitals(json_lst)
        // setShowActuals(true)

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

    if (center && nearestHospitals.length == 0) {
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
    // console.log("Nearest hospitals:", nearestHospitals);
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
      minHeight="163vh"
      // background="linear-gradient(180deg, brand.500 0%, brand.200 100%)"
      // backgroundAttachment="fixed"
      style={{
        backgroundColor: "rgb(246, 246, 246)",
      }}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgb(246, 246, 246)",
        zIndex: 0
      }}
    >
      <Container 
        maxW="container.xl" 
        height="100vh"
        py={8}
        display="flex" 
        flexDirection="column"
        style={{
          backgroundColor: "rgb(246, 246, 246)",
        }}
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
            width="80%"
            maxWidth="800px"
            style={{
              backgroundColor: "rgb(246, 246, 246)",
            }}
          >
            <CardBody py={8}>
              <VStack spacing={6} style={{display: (status === 'idle' ? 'block' : 'none')}} >
                <InputGroup
                  bg={cardBg}
                  size="lg"
                  transition="all 0.2s"
                  transform={searchTerm ? "scale(1.02)" : "scale(1)"}
                  borderRadius="xl"
                  // overflow="hidden"
                  height="120px"
                  style={{
                    backgroundColor: "rgb(246, 246, 246)",
                  }}
                >
                  {/* <InputLeftElement 
                    pointerEvents='none'
                    transition="all 0.3s"
                    transform={isFocused ? "translateX(-4px)" : "translateX(0)"}
                    h="auto"
                    top="20px"
                  >
                    <Icon as={FaNotesMedical} color="gray.400" boxSize={5} />
                  </InputLeftElement> */}
                  <Input
                    placeholder="I have a a rash on my arm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    borderColor="brand.200"
                    height="100%"
                    minHeight="120px"
                    fontSize="lg"
                    as="textarea"
                    resize="none"
                    // textAlign="center"
                    pt="16px"
                    pl="23px"
                    pr="45px"
                    _hover={{ 
                      borderColor: "brand.300",
                      transform: "scale(1.01)",
                      boxShadow: "0 0 8px rgba(128, 90, 213, 0.2)"
                    }}
                    _focus={{
                      textAlign: "left",
                      pt: "16px",
                      borderColor: "brand.500",
                      boxShadow: "0 0 12px rgba(128, 90, 213, 0.3)",
                      transform: "scale(1.03)"
                    }}
                    transition="all 0.2s"
                  />
                  <InputRightElement 
                    h="auto"
                    top="2px"
                    pr={2}
                  >
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: '1rem',
                }}>
                  <Button
                    bg="white"
                    color="brand.500"
                    borderRadius="xl"
                    px={8}
                    py={4}
                    style={{
                    }}
                    _hover={{
                      bg: 'white',
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 12px rgba(128, 90, 213, 0.3)',
                      marginTop: '30px'
                    }}
                    transition="all 0.2s"
                    onClick={() => {submitQuery()}}
                  >
                    Submit
                  </Button>
                </div>
              </VStack>
              <div style={{display: (status !== 'idle' ? 'block' : 'none')}}
                

              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // font size
                  fontSize: '1.5rem',
                  // color: 'white',
                  padding: '1rem',
                  font: 'bold',
                  fontFamily: 'ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol',
                }}><Spinner style={{marginRight: '10px'}}></Spinner>{statusTexts[statusTextIndex]}</div>
                
                </div>
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
              {/* {!useCurrentLocation && (
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
              )} */}
              
              <Box
                bg={cardBg}
                borderRadius="lg"
                overflow="hidden"
                borderWidth="0px"
                borderColor="transparent"
                _hover={{
                  backgroundColor: "transparent",
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
                  id="mapmove"
                >
                  {/* User location blue marker (only when using current location) */}
                  {userLocation && useCurrentLocation && (
                    // <Marker
                    //   position={userLocation}
                    //   icon={{
                    //     url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    //     scaledSize: new window.google.maps.Size(40, 40),
                    //   }}
                    //   title="Your Location"
                    // />
                    <>  </>
                  )}

                  {nearestHospitals.map((hospital, index) => {
                    if (!hospital) {
                      console.warn(`Hospital at index ${index} is undefined or null`);
                      return null;
                    }

                    // Use lowercase field names to match backend
                    const name = hospital.NAME || 'Unknown Hospital';
                    const address = hospital.ADDRESS || 'Address not available';
                    // const lat = parseFloat(hospital.LATITUDE);
                    // const lng = parseFloat(hospital.LONGITUDE);

                    const lat = hospital.LATITUDE
                    const lng = hospital.LONGITUDE
                    // console.log(lat, lng, name, address)

                    // const name = hospital.name || 'Unknown Hospital';
                    // const address = hospital.address || 'Address not available';
                    // // const lat = parseFloat(hospital.LATITUDE);
                    // // const lng = parseFloat(hospital.LONGITUDE);

                    // const lat = hospital.latitude
                    // const lng = hospital.longitude
                    // console.log(lat, lng, name, address)

                    // console.log(hospital.Distance)
                    
                    if (isNaN(lat) || isNaN(lng)) {
                      console.warn(`Invalid coordinates for hospital: ${name}`);
                      return null;
                    }

                    return (
                      // <p></p>
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
                      {/* <Marker
                      key={19}  // Use a unique identifier for the key
                      position={{ lat: 42.778690, lng: -74.056410}}
                      title={"HEYYY"}
                      onClick={(e) => {
                        // Prevent default behavior and stop event propagation
                        e.domEvent.stopPropagation();

                      }}
                      options={{
                        clickable: true,
                        zIndex: 1000
                      }}
                    /> */}

                  {hoveredHospital && (
                    <InfoWindow
                      position={new window.google.maps.LatLng(
                        parseFloat(hoveredHospital.LATITUDE),
                        parseFloat(hoveredHospital.LONGITUDE)
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
                        <h4 style={{ fontWeight: 'bold', marginBottom: '5px' }}>{hoveredHospital.NAME}</h4>
                        <p style={{ marginBottom: '5px' }}>{hoveredHospital.ADDRESS}</p>

                        <p style={{marginBottom: '3px'}}>Total Copay: <strong>${Math.round(100*hoveredHospital.total_cost_copay) / 100}</strong></p>
                        <p style={{marginBottom: '3px'}}>Total Cost: ${Math.round(100*hoveredHospital.total_cost_overall)/ 100}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetDirections(hoveredHospital);
                          }}
                          style={{
                            marginTop: '5px',
                            padding: '5px 10px',
                            paddingLeft: '0x',
                            marginLeft: '-10px',
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
                      iconColor="black"       // Set the color of the checkmark to black
                      size="lg"
                      borderColor="gray.500"
                      colorScheme="gray"       // Set a color scheme to match the black styling
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


                  {/* <div style={{display: 'flex'}}>
                        <H1></H1>
                  </div> */}
              </Flex>

              <div style={{display: 'flex', justifyContent: 'center', marginTop: '40px', flexDirection: 'row',
            'display': showActuals ? 'flex' : 'none'}}>
                <div 
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    fontFamily: 'system-ui',
                  }}
                >Cheapest Nearby Hospitals</div>

              <div style={{ color: 'black', display: 'flex', flexDirection: 'column', width: '100%' }}>
                {
                  nearestHospitals.map((hospital, index) => (
                    <div key={index} 
                    onClick={
                      () => {
                        setShowTeatsHospital(hospital);
                        setShowTreatsModal(true);
                      }
                    }
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '10px',
                      borderRadius: '5px',
                      margin: '10px',
                      backgroundColor: 'rgba(248, 248, 248)', // very light gray
                      shadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                      fontFamily: 'system-ui',
                      cursor: 'pointer',
                    }}>
                      {/* Uncomment these lines as needed */}
                      <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        fontFamily: 'system-ui',
                      }}>{hospital.NAME}</p>
                      <p style={{
                        fontSize: '0.9rem',
                        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif;', // thin font
                      }}>{hospital.ADDRESS}, {hospital.CITY}, {hospital.STATE}, {hospital.ZIP}</p>
                      <div style={{fontWeight: 'bold', marginTop: '15px'}}>
                        <p>Total Copay: ${Math.round(100 * hospital.total_cost_copay) / 100}</p>
                        <p>Total Cost: ${Math.round(100 * hospital.total_cost_overall) / 100}</p>
                      </div>
                      <button
                      style={{
                        padding: '5px 10px',
                        width: '150px',
                        marginLeft: '-25px',
                        marginTop: '10px'
                      }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetDirections(hospital);
                        }}
                      >
                        Get Directions
                      </button> 
                      <p>Contact: {hospital.TELEPHONE}</p>
                      <p>Website: {hospital.WEBSITE}</p>
                      <p>Type: {hospital.TYPE}</p>
                    </div>
                  ))
                }
              </div>
                  

              </div>
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
              <HStack spacing={4} width="100%">
                <Button
                  colorScheme="red"
                  onClick={() => {
                    // Stop and discard recording
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                      mediaRecorder.stop();
                      chunksRef.current = []; // Clear chunks
                    }
                    if (recordingTimerId) {
                      clearInterval(recordingTimerId);
                      setRecordingTimerId(null);
                    }
                    setRecordingTime(0);
                    setIsRecording(false);
                  }}
                  size="lg"
                  width="50%"
                  borderRadius="full"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="brand"
                  onClick={() => handleVoiceSearch()}
                  size="lg"
                  width="50%"
                  borderRadius="full"
                >
                  Done
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>


      <Modal isOpen={showTreatsModal} size={"xl"} isCentered >
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(1px)"
        />
        <ModalContent
          bg={cardBg}
          borderRadius="xl"
          boxShadow="xl"
          // maxW="400px"
          p={6}
        >
          <ModalBody>
            <VStack spacing={6}>
              <Heading size="md" style={{
                textAlign: 'center',
              }}>Specific Breakdown for {showTeatsHospital && showTeatsHospital.NAME}</Heading>
              <Text fontSize="4xl" fontWeight="bold">
                
              </Text>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                fontFamily: 'system-ui',
              }}>Possible Treatments:</div>
              {showTeatsHospital && showTeatsHospital.treatments && showTeatsHospital.treatments.map((treatment, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '10px',
                  borderRadius: '5px',
                  margin: '10px',
                  backgroundColor: 'rgba(248, 248, 248)', // very light gray
                  shadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                  fontFamily: 'system-ui',
                }}>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    fontFamily: 'system-ui',
                  }}>{treatment && treatment["Service Name"]}</p>
                   <p style={{
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    fontFamily: 'system-ui',
                  }}>CPT Code: {treatment && treatment["CPT Code"]}</p>
                   <p style={{
                    fontSize: '0.7rem',
                    fontFamily: 'system-ui',
                  }}>Description: {treatment && treatment["Description"]}</p>
                  <p style={{
                    fontSize: '0.7rem',
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif;', // thin font
                  }}>Estimated Total Cost: ${(treatment && Math.round(treatment["varianced_cost_total"] * 100))/100}</p>
                   <p style={{
                    fontSize: '0.7rem',
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif;', // thin font
                  }}>Estimated Copay: ${(treatment && Math.round(treatment["varianced_cost_copay"] * 100))/100}</p>
                   <p style={{
                    fontSize: '0.7rem',
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif;', // thin font
                  }}>Category: {(treatment && treatment["Category"] )}</p>
                  <p style={{
                    fontSize: '0.7rem',
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif;', // thin font
                  }}>Chance of Use: {(treatment && treatment["Probability"] *100 )}{'%'}</p>
              </div>
              ))}
              </div>
              <HStack spacing={4} width="100%">
                <Button
                  colorScheme="red"
                  onClick={() => {
                    setShowTreatsModal(false);
                  }}
                  size="lg"
                  width="100%"
                  borderRadius="full"
                >
                  Close
                </Button>
              </HStack>
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