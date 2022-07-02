import {Flex, Stack, Text, useColorModeValue} from '@chakra-ui/react'

function FailedToGetLocations(props: { isOpen: boolean }) {
  const color  = useColorModeValue('gray.500', 'gray.400')
  const bg = useColorModeValue('gray.100', 'gray.800')
  if (!props.isOpen) return null
  return (
    <Flex
      px={[3]}
      py={[3]}
      borderRadius={8}
      justify="space-between"
      alignItems="center"
      _hover={{bg}}
    >
      <Stack spacing={-1}>
        <Text color={color} >Failed to fetch location options. Please try again</Text>
      </Stack>
    </Flex>
  )
}


export default FailedToGetLocations
