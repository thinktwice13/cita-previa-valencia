import {ChakraProvider} from "@chakra-ui/provider";
import type {AppProps} from 'next/app'
import MessagingProvider from "../lib/messaging";
import {theme} from "../styles/theme";

function MyApp({Component, pageProps}: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <MessagingProvider>
        <Component {...pageProps} />
      </MessagingProvider>
    </ChakraProvider>

  )
}

export default MyApp
