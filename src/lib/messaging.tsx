import {useToast} from "@chakra-ui/react";
import {getMessaging, getToken, isSupported, MessagePayload, onMessage} from '@firebase/messaging'
import {createContext, PropsWithChildren, useContext, useEffect, useState} from 'react'
import firebase from '../utils/firebase-client'

interface MessagingContext {

  // A firebase registration token used for identifying the device to send notifications to
  // Requires device/browser notifications to be granted
  token: string

  // Explict token request. Will also ask user for notifications permission for the device
  requestToken: () => Promise<string>

  // Whether the device supports push notifications
  isPushSupported: boolean

  // A custom Notification.permission == "denied  flag
  // Some browsers deny notification permission by default
  // This flag is false until user is shown custom UI (only on initial action that requires notifications)
  // If used denied, set to true and don't repeat the custom UI prompt
  isDenied: boolean
}

const ctx = createContext<MessagingContext>({} as MessagingContext)

function MessagingProvider(props: PropsWithChildren) {
  const [isPushSupported, setIsPushSupported] = useState<boolean>(true)
  const [token, setToken] = useState<string>('')
  const [areNotificationsDenied, setAreNotificationsDenied] = useState<boolean>(false)
  const toast = useToast({
    status: 'info',
    isClosable: true,
    duration: 10 * 1000,
    variant: 'solid',
  })

  useEffect(() => {
    isSupported().then(supported => {
      if (!supported) return setIsPushSupported(false)

      // Only try to get the registration token if push messages are supported on device and permission is already granted
      // Notification permissions should only be requested user action handles
      if (Notification.permission === 'granted') getMessagingToken().then(setToken)
    }).catch(err => console.error({err}))
  }, [])

  // Attach message listener to show a notification when app is in the foreground
  useEffect(() => {
    if (!token) return
    const unsubscribe = onMessage(getMessaging(firebase),
      (payload: MessagePayload) => {
        toast.closeAll();
        toast({
          title: payload.notification?.title,
          description: payload.notification?.body,
        });
      }
    );

    return () => {
      unsubscribe && unsubscribe()
    }
  }, [token]);

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

function getMessagingToken(): Promise<string> {
  return getToken(getMessaging(firebase), {vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY})
}

export function useMessaging() {
  return useContext(ctx)
}

export default MessagingProvider
