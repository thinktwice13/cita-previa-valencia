import { useColorModeValue } from '@chakra-ui/color-mode'
import { Box, Heading, Text } from '@chakra-ui/react'

const Header = () => {
  return (
    <Box mb={[8, 10, 12]}>
      <Heading as="h1" textAlign="center" size="2xl" letterSpacing="tighter" fontWeight="800">
        Cita Previa{' '}
        <Box as="span" color={useColorModeValue('orange.500', 'orange.400')}>
          València
        </Box>
      </Heading>

      <Text textAlign="center" fontSize={14} color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
        Subscribe for a push notification when new appointments are available
      </Text>
    </Box>
  )
}

export default Header
