import {Alert, AlertDescription, AlertIcon, AlertTitle} from '@chakra-ui/alert'
import {Box} from '@chakra-ui/layout'
import {useEffect, useState} from 'react'
import {useMessaging} from '../messaging'

/** Renders when user's device does not support Push API */
function PushNotSupported(): JSX.Element | null {
  const {isPushSupported} = useMessaging()
  const [description, setDescription] = useState<string>('')

  /** Handle notices for different platforms and browsers */
  useEffect(() => {
    if (isPushSupported) return
    const isIOS =
      /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)

    const desc = isIOS
      ? 'Sorry, push notifications from websites are not supported on your device.'
      : 'Sorry, push notifications from websites are not supported in this browser. Please use a different one.'

    setDescription(desc)
  }, [isPushSupported])

  // When rendered on server or web pushis supported, do not show
  if (isPushSupported || !description) return null // Do not show warning if not in nbrowser environment or messaging is supported

  return (
    <Alert status="warning" variant="solid" borderRadius={8}>
      <AlertIcon/>
      <Box flex="1">
        <AlertTitle>Web notifications not supported!</AlertTitle>
        <AlertDescription display="block">{description}</AlertDescription>
      </Box>
    </Alert>
  )
}

PushNotSupported.defaultProps = {
  isVisible: false,
}

export default PushNotSupported
