import { Box, Collapse, Heading, useDisclosure, useToast } from '@chakra-ui/react'
import Location from '../locations/Location'
import { useMessaging } from '../messaging'
import { useEffect, useState } from 'react'
import { getServiceSubscriptions, subscribe, unsubscribe } from './db'

const locations = [
  { name: 'location', id: '1' },
  { name: 'location', id: '2' },
  { name: 'location', id: '3' },
  { name: 'location', id: '4' },
  { name: 'location', id: '5' }
]

interface ServiceProps {
  id: number;
  name: string;
}

function Service (props: ServiceProps) {
  const { isOpen, onToggle } = useDisclosure({ isOpen: true })
  const [subscriptions, setSubscriptions] = useState<Record<string, string>>({})
  const { token, isDenied, requestToken } = useMessaging()
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

  const handleUnsubscribe = async (locationId: string): Promise<void> => {
    const subscriptionId = subscriptions[locationId]
    try {
      delete subscriptions[locationId]
      setSubscriptions({ ...subscriptions })
      await unsubscribe(props.id, subscriptionId)
      const updates = await getServiceSubscriptions(token, props.id)
      return setSubscriptions(updates)
    } catch (error) {
      console.error(error)
      errToast({ description: `Something went wrong while unsubscribing from ${props.name}` })
      // Revert optimistic update
      setSubscriptions(prev => ({ ...prev, [locationId]: subscriptionId }))
    }
  }

  const handleSubscribe = async (locationId: string): Promise<void> => {
    try {
      const token = await requestToken()
      if (!token) return // TODO
      // Optimistic update
      setSubscriptions(prev => ({ ...prev, [locationId]: 'optimisticId' }))
      // Subscribe to service
      await subscribe(token, props.id, locationId)
      const updates = await getServiceSubscriptions(token, props.id)
      setSubscriptions(updates)
    } catch (error) {
      console.error(error)
      errToast({ description: `Something went wrong while subscribing to ${props.name}` })
      // Revert optimistic update
      delete subscriptions[locationId]
      return setSubscriptions({ ...subscriptions })
    }
  }

  return (
    <Box onClick={onToggle}>
      <Heading>{props.name}</Heading>
      <Collapse in={isOpen}>
        {locations.map(loc => {
          const isSubscribed = !!subscriptions[loc.id]
          return (
            <Location
              key={loc.id}
              name={loc.name}
              isSubscribed={isSubscribed}
              isDisabled={isDenied}
              onToggle={() => isSubscribed ? handleUnsubscribe(loc.id) : handleSubscribe(loc.id)}
            />
          )
        })}
      </Collapse>
    </Box>
  )
}

export default Service
