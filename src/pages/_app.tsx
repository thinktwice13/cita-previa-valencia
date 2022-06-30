import {ChakraProvider} from "@chakra-ui/provider";
import {Container} from "@chakra-ui/react";
import type {AppProps} from 'next/app'
import MessagingProvider from "../lib/messaging";
import SubscriptionsProvider from "../lib/subscriptions";
import {theme} from "../styles/theme";

function MyApp({Component, pageProps}: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <MessagingProvider>
        <SubscriptionsProvider>
          <Container px={[0, 2, 3]} maxW="1000px" pt={[8, 10, 12]}>
            <Component {...pageProps} />
          </Container>
        </SubscriptionsProvider>
      </MessagingProvider>
    </ChakraProvider>
  )
}

export default MyApp
