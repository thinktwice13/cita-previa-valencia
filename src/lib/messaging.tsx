import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { isSupported, getMessaging, getToken } from '@firebase/messaging'
import firebase from '../utils/firebase'

interface MessagingContext {
  token: string
  isPushSupported: boolean
  requestToken: () => Promise<string>
  isDenied: boolean
}

const ctx = createContext<MessagingContext>({} as MessagingContext)
function MessagingProvider (props: PropsWithChildren) {
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false)
  const [token, setToken] = useState<string>('')

  // A custom Notification.permission == "denied  flag
  // Some browwsers block notificaiton permisisons by default
  // This flag is false until user is shown custom UI (only on initial action that requires notifications)
  // If used denied, set to true and don't repeat the custom UI prompt
  const [areNotificationsDenied, setAreNotificationsDenied] = useState<boolean>(false)

  useEffect(() => {
    isSupported().then(supported => {
      if (!supported) return setIsPushSupported(false)

      // Only try to get the registration token if push messages are supported on device and permission is already granted
      // Notification permissions should only be requested user action handles
      if (Notification.permission === 'granted') getMessagingToken().then(setToken)
    })
  }, [])

  // Token request for user action handles
  // Returns saved token if present
  // Shows notification permission prompt if not granted
  const requestToken = async (): Promise<string> => {
    if (token) return token

    try {
      // Show custom notifications permissions prompt if this is the first user request
      if (Notification.permission === 'denied' && !areNotificationsDenied) {
        // TODO Show alert
      }

      // If no option selected by user yet, show browser notification permission prompt
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }

      // If device notification permission granted, get registration token from firebase
      if (Notification.permission === 'granted') {
        const token = await getMessagingToken()
        // When token retrieved, store for future use, but also return to requester
        setToken(token)
        return token
      }

      // Reachable if user ignores app notification permission UI prompt
      setAreNotificationsDenied(true)
      return ''
    } catch (err) {
      console.error(err)
      return ''
    }
  }

  return <ctx.Provider value={{
    isPushSupported,
    isDenied: areNotificationsDenied,
    token,
    requestToken
  }}>{props.children}</ctx.Provider>
}

function getMessagingToken (): Promise<string> {
  return getToken(getMessaging(firebase), { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY })
}

export function useMessaging () {
  return useContext(ctx)
}

export default MessagingProvider
