import {ChakraProvider} from "@chakra-ui/provider";
import {Container} from "@chakra-ui/react";
import type {AppProps} from 'next/app'
import MessagingProvider from "../lib/messaging";
import {theme} from "../styles/theme";

function MyApp({Component, pageProps}: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <MessagingProvider>
        <Container px={[0, 2, 3]} maxW="1000px" pt={[8, 10, 12]}>
          <Component {...pageProps} />
        </Container>
      </MessagingProvider>
    </ChakraProvider>
  )
}

export default MyApp
