import {useToast} from '@chakra-ui/react'
import {captureException, captureMessage} from "@sentry/nextjs";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  increment,
  query,
  serverTimestamp,
  where,
  writeBatch
} from "firebase/firestore";
import {createContext, PropsWithChildren, useContext, useEffect, useMemo, useState} from "react";
import firebase from "../utils/firebase-client";
import {useMessaging} from "./messaging";

interface SubscriptionsContext {
  subscriptions: Record<string, string>
  subscribe: (topic: string) => Promise<void>
  unsubscribe: (topic: string) => Promise<void>
}

const ctx = createContext({} as SubscriptionsContext)

function SubscriptionsProvider(props: Readonly<PropsWithChildren>) {
  const {token, requestToken} = useMessaging()
  const [subscriptions, setSubscriptions] = useState<Record<string, string>>({})
  const toast = useToast({
    description: "Something went wrong",
    status: "error",
    duration: 5000,
    isClosable: true,
  })

  useEffect(() => {
    if (!token) return
    getDeviceSubscriptions(token).then(setSubscriptions).catch(() => captureMessage("Failed to retrieve subscriptions", "warning"))
  }, [token])

  const handleSubscribe = async (topic: string): Promise<void> => {
    try {
      const token = await requestToken()
      if (!token) {
        console.error("Failed to retrieve registration token")
        return // TODO
      }
      // Optimistic update
      setSubscriptions(prev => ({...prev, [topic]: 'optimisticId'}))
      // Subscribe to service
      await subscribe(topic, token)
      const updates = await getDeviceSubscriptions(token)
      setSubscriptions(updates)
    } catch (error) {
      captureException(error)
      captureMessage("Subscription failed", "warning")

      // Revert optimistic update
      delete subscriptions[topic]
      setSubscriptions({...subscriptions})
      toast({
        title: 'Error subscribing',
      })
    }
  }

  const handleUnsubscribe = async (topic: string): Promise<void> => {
    console.log({topic})
    const subscriptionId = subscriptions[topic]
    try {
      delete subscriptions[topic]
      setSubscriptions({...subscriptions})
      await unsubscribe(topic, subscriptionId)
      const updates = await getDeviceSubscriptions(token)
      setSubscriptions(updates)
    } catch (error) {
      captureException(error)
      captureMessage("Unsubscribe failed", "warning")
      // Revert optimistic update
      setSubscriptions(prev => ({...prev, [topic]: subscriptionId}))
      toast({
        title: 'Error unsubscribing',
      })
    }
  }

  const value = useMemo(() => ({subscriptions, subscribe: handleSubscribe, unsubscribe: handleUnsubscribe}), [subscriptions])
  return <ctx.Provider value={value}>{props.children}</ctx.Provider>
}

interface UseSubscriptionReturn {
  isSubscribed: boolean
  onToggle: () => Promise<void>
}

export function useSubscription(topic: string): UseSubscriptionReturn {
  const {subscriptions, subscribe, unsubscribe} = useContext(ctx)
  const subscriptionId = subscriptions[topic]

  return {
    isSubscribed: !!subscriptionId,
    onToggle: () => subscriptionId ? unsubscribe(topic) : subscribe(topic)
  }
}

function subscribe(topic: string, token: string): Promise<void> {
  if (!token || !topic) {
    throw new Error('Missing required parameters')
  }
  const wb = writeBatch(getFirestore(firebase))
  const docRef = doc(collection(getFirestore(firebase), 'subscriptions'))
  wb.set(docRef, {token, topic, time: serverTimestamp()})

  const topicRef = doc(collection(getFirestore(firebase), 'topics'), topic)
  wb.set(topicRef, {
    'active': increment(1)
  }, {merge: true})

  return wb.commit()
}

function unsubscribe(topic: string, subscriptionId: string): Promise<void> {
  if (!topic || !subscriptionId) {
    throw new Error('Missing required parameters')
  }

  const wb = writeBatch(getFirestore(firebase))
  wb.delete(doc(collection(getFirestore(firebase), 'subscriptions'), subscriptionId))

  const topicRef = doc(collection(getFirestore(firebase), 'topics'), topic)
  wb.update(topicRef, {
    'active': increment(-1)
  })

  return wb.commit()
}


async function getDeviceSubscriptions(token: string): Promise<Record<string, string>> {
  if (!token) {
    return Promise.reject(new Error('Missing token or serviceId'))
  }

  const q = query(collection(getFirestore(firebase), 'subscriptions'), where('token', '==', token))

  // Format subscriptions
  return getDocs(q)
    .then(snap => snap.docs
      .reduce((acc, doc) => ({...acc, [doc.data().topic]: doc.id}), {} as Record<string, string>))
}

export default SubscriptionsProvider