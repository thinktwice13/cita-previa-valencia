import {Flex, Stack, Switch, Text, useColorModeValue} from '@chakra-ui/react'
import {useSubscription} from "../subscriptions";
import {formatAppointments} from "./utils";

// Service location JSON data received form api
export interface LocationData {
  id: string
  name: string
  appointments?: string[]
}

interface LocationProps {
  // Subscription topic id
  topic: string

  // Display name for the location
  name: string;

  // List of available appointments in string date format
  appointments?: string[]

  // Whether switch is disabled. Only when user has explicitly denied web notifications for the device
  isDisabled?: boolean
}

function Location(props: Readonly<LocationProps>) {
  const {isSubscribed, onToggle } = useSubscription(props.topic)

  return (
    <Flex
      px={[3]}
      py={[3]}
      borderRadius={8}
      justify="space-between"
      alignItems="center"
      _hover={{bg: useColorModeValue('gray.100', 'gray.800')}}
    >
      <Stack spacing={-1}>
        <Text>{props.name}</Text>
        <Smalltext data={props.appointments}/>
      </Stack>
      {
        !props.appointments &&
          <Switch size="lg" isChecked={isSubscribed} onChange={onToggle} isDisabled={false}/>
      }
    </Flex>
  )
}

function Smalltext(props: Readonly<{ data?: string[] }>) {
  const color = useColorModeValue('gray.500', 'gray.400')
  return <Text color={color}>{props.data?.length ? formatAppointments(props.data) : "Not available. Subscribe"}</Text>
}

export default Location
