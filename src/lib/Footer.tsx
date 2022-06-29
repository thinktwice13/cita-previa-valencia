import {useColorModeValue} from '@chakra-ui/color-mode'
import {Box, Flex, HStack, Link, Text, VStack} from '@chakra-ui/react'
import NextLink from 'next/link'

type FooterLinkProps = { to: string; label: string }
const FooterLink = ({to, label}: FooterLinkProps) => {
  return (
    <NextLink href={to} passHref>
      <Link
        color={useColorModeValue('gray.500', 'gray.400')}
        fontWeight="700"
        transition="none"
        _hover={{
          textDecor: 'none',
          color: 'steelblue',
          transition: 'none',
        }}
      >
        {label}
      </Link>
    </NextLink>
  )
}

/** Footer: Displays links to Privacy and Terms pages */
const Footer = () => {
  return (
    <VStack spacing={2} py={8}>
      <Text color={useColorModeValue('gray.500', 'gray.400')} fontWeight="700">
        From{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.valencia.es/cas/tramites/cita-previa/-/content/portada-cita-previa-2020?uid=62073EF0AB33BD52C125857C0039F2BE"
        >
          <Box
            _hover={{
              textDecor: 'none',
              color: useColorModeValue('orange.600', 'orange.500'),
              transition: 'none',
            }}
            fontWeight="700"
            as="span"
            color={useColorModeValue('orange.500', 'orange.400')}
          >
            www.valencia.es
          </Box>
        </a>
      </Text>
      <Flex justifyContent="center" mt={6} mb={12}>
        <HStack spacing={6}>
          <FooterLink to="/privacy" label="Privacy"/>
          <FooterLink to="/terms" label="Terms"/>
        </HStack>
      </Flex>
    </VStack>
  )
}

export default Footer
