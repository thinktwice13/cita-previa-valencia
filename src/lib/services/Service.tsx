import {Box, Collapse, Text, useDisclosure, useToast} from '@chakra-ui/react'
import {useEffect, useState} from 'react'
import Location, {LocationData} from '../locations/Location'
import {useMessaging} from '../messaging'
import {getServiceLocations, getServiceSubscriptions, subscribe, unsubscribe} from './db'

interface ServiceProps {
  id: string;
  name: string;
}

function Service(props: ServiceProps) {
  const {isOpen, onToggle} = useDisclosure()
  const [subscriptions, setSubscriptions] = useState<Record<string, string>>({})
  const {token, isDenied, requestToken} = useMessaging()
  const [isLoaidng, setIsLoading] = useState<boolean>(true)
  const [locations, setLocations] = useState<LocationData[]>([])
  const errToast = useToast({
    title: 'Error',
    duration: 5000,
    isClosable: true,
    status: 'error'
  })

  useEffect(() => {
    if (!token) return
    getServiceSubscriptions(token, props.id).then(setSubscriptions)
  }, [token])

  useEffect(() => {
    if (!isOpen || !!locations.length) {
      return
    }

    setIsLoading(true)
    getServiceLocations(props.id)
      .then(setLocations)
      .catch(console.error) // TODO
      .finally(() => setIsLoading(false))
  }, [isOpen])

  const handleUnsubscribe = async (locationId: string): Promise<void> => {
    const subscriptionId = subscriptions[locationId]
    try {
      delete subscriptions[locationId]
      setSubscriptions({...subscriptions})
      await unsubscribe(props.id, subscriptionId)
      const updates = await getServiceSubscriptions(token, props.id)
      return setSubscriptions(updates)
    } catch (error) {
      console.error(error)
      errToast({description: `Something went wrong while unsubscribing from ${props.name}`})
      // Revert optimistic update
      setSubscriptions(prev => ({...prev, [locationId]: subscriptionId}))
    }
  }

  const handleSubscribe = async (locationId: string): Promise<void> => {
    try {
      const token = await requestToken()
      if (!token) return // TODO
      // Optimistic update
      setSubscriptions(prev => ({...prev, [locationId]: 'optimisticId'}))
      // Subscribe to service
      await subscribe(token, props.id, locationId)
      const updates = await getServiceSubscriptions(token, props.id)
      setSubscriptions(updates)
    } catch (error) {
      console.error(error)
      errToast({description: `Something went wrong while subscribing to ${props.name}`})
      // Revert optimistic update
      delete subscriptions[locationId]
      return setSubscriptions({...subscriptions})
    }
  }

  return (
    <Box>
      <Box onClick={onToggle} cursor={"pointer"} >
        <Text>{props.name}</Text>
      </Box>
      <Collapse in={isOpen && !!locations.length}>
        {locations.map(loc => {
          const isSubscribed = !!subscriptions[loc.id]
          return (
            <Location
              key={loc.id}
              name={loc.name}
              isSubscribed={isSubscribed}
              isDisabled={isDenied}
              appointments={loc.appointments}
              onToggle={() => isSubscribed ? handleUnsubscribe(loc.id) : handleSubscribe(loc.id)}
            />
          )
        })}
      </Collapse>
    </Box>
  )
}

export default Service
