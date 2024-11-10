import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import theme from './theme'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    {/* <ChakraProvider theme={theme} initialColorMode="light" forcedColorMode="light"> */}
      <ChakraProvider theme={theme}>
        {/* <ColorModeScript initialColorMode="light" /> */}
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>,
)
