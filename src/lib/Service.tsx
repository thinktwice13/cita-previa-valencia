import {useColorModeValue} from "@chakra-ui/color-mode";
import {ChevronDownIcon, ChevronUpIcon} from '@chakra-ui/icons'
import {Box, Collapse, Flex, Spinner, Text, useDisclosure} from '@chakra-ui/react'
import {useEffect, useState} from 'react'
import Location from './locations/Location'
import {useMessaging} from './messaging'

interface ServiceProps {
  id: string;
  name: string;
}

interface LocationData {
  id: string
  name: string
  appointments?: string[]
}

function Service(props: ServiceProps) {
  const {isOpen, onToggle} = useDisclosure()
  const {isDenied} = useMessaging()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [locations, setLocations] = useState<LocationData[]>([])

  useEffect(() => {
    if (!isOpen || !!locations.length) return

    setIsLoading(true)
    getServiceLocations(props.id)
      .then(setLocations)
      .catch(console.error) // TODO
      .finally(() => setIsLoading(false))
  }, [isOpen])

  return (
    <Box>
      <Flex
        bg={useColorModeValue('gray.100', 'gray.800')}
        onClick={onToggle}
        cursor="pointer"
        position="sticky"
        top="0"
        px={[3]}
        py={[5]}
        borderRadius={[0, 8]}
        alignItems="center"
        justifyContent={'space-between'}
      >
        <Text fontWeight="800" letterSpacing="tighter" pr={2}>
          {props.name}
        </Text>
        <ServiceHeaderRightIcon isOpen={isOpen} isLoading={isLoading}/>
      </Flex>

      <Collapse in={isOpen && !!locations.length}>
        <Box mt={2}>
          {locations.map(loc => <Location
              key={loc.id}
              topic={loc.id}
              name={loc.name}
              isDisabled={isDenied}
              appointments={loc.appointments}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

function ServiceHeaderRightIcon(props: { isLoading: boolean, isOpen: boolean }) {
  const color = useColorModeValue('gray.500', 'gray.400')

  if (props.isLoading) return <Spinner color={color} thickness={"2px"} speed={"2.5s"} label={"Loading"} boxSize={6}/>
  if (props.isOpen) return <ChevronUpIcon color={color} boxSize={6}/>
  return <ChevronDownIcon color={color} boxSize={6}/>
}

function getServiceLocations(serviceId: string): Promise<LocationData[]> {
  return fetch(`/api/services/${serviceId}/locations`)
    .then(res => {
      if (!res.ok) {
        throw new Error(res.statusText)
      }
      return res.json()
    })
}

export default Service
