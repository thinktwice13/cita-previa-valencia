import {Box, Flex, Stack, Switch, Text, useColorModeValue} from '@chakra-ui/react'
import {formatAppointments} from "./utils";

// Service location JSON data received form api
export interface LocationData {
  id: string
  name: string
  appointments?: string[]
}

interface LocationProps {
  // Display name for the location
  name: string;

  // List of available appointments in string date format
  appointments?: string[]

  // Switch toggle for (un)subscribe action
  onToggle: () => void

  // Whether the location is currently subscribed for a notification
  isSubscribed?: boolean

  // Whether switch is disabled. Only when user has explicitly denied web notifications for the device
  isDisabled?: boolean
}

function Location(props: LocationProps) {
  return (
    <Flex
      px={[3]}
      py={[3]}
      borderRadius={8}
      justify="space-between"
      alignItems="center"
      _hover={{ bg: useColorModeValue('gray.100', 'gray.800') }}
    >
      <Stack spacing={-1}>
        <Text>{props.name}</Text>
        <Smalltext data={props.appointments}/>
      </Stack>
      {
        !props.appointments && <Switch size="lg" isChecked={!!props.isSubscribed} onChange={props.onToggle} isDisabled={!!props.isDisabled}/>
      }
    </Flex>
  )
}

function Smalltext(props: { data?: string[] })  {
  const color = useColorModeValue('gray.500', 'gray.400')
  return <Text color={color}>{!!props.data?.length ? formatAppointments(props.data) : "Not available. Subscribe"}</Text>
}

export default Location
