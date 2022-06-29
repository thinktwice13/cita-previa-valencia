import {Box, Flex, Switch, Text, useColorModeValue} from '@chakra-ui/react'
import {formatAppointments} from "./utils";

interface LocationProps {
  name: string;
  appointments?: string[]
  onToggle: () => void
  isSubscribed?: boolean
  isDisabled?: boolean
}

export interface LocationData {
  id: string
  name: string
  appointments?: string[]
}


function Location(props: LocationProps) {
  return (
    <Flex justifyContent={'space-between'} alignItems={'center'}>
      <Box>
        <Text>{props.name}</Text>
        <Text color={useColorModeValue('gray.500', 'gray.400')}>{formatAppointments(props.appointments)}</Text>
      </Box>
      {
        !props.appointments && <Switch isChecked={!!props.isSubscribed} onChange={props.onToggle} isDisabled={!!props.isDisabled}/>
      }
    </Flex>
  )
}

export default Location
