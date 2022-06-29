import { collection, doc, getDocs, getFirestore, increment, query, where, writeBatch } from 'firebase/firestore'
import firebase from '../../utils/firebase'

export function subscribe (token: string, serviceId: number, locationId: string): Promise<string> {
  if (!token || !serviceId || !locationId) {
    throw new Error('Missing required parameters')
  }

  const wb = writeBatch(getFirestore(firebase))
  const docRef = doc(collection(getFirestore(firebase), 'subscriptions'))
  const serviceRef = doc(collection(getFirestore(firebase), 'services'), serviceId + '')
  wb.set(docRef, { token, serviceId, locationId })
  wb.set(serviceRef, {
    'subscriptions': increment(1)
  }, { merge: true })

  return wb.commit().then(() => docRef.id)
}

export function unsubscribe (serviceId: number, subscriptionId: string): Promise<void> {
  if (!subscriptionId) {
    throw new Error('Missing required parameters')
  }

  const wb = writeBatch(getFirestore(firebase))
  const serviceRef = doc(collection(getFirestore(firebase), 'services'), serviceId + '')
  wb.delete(doc(collection(getFirestore(firebase), 'subscriptions'), subscriptionId))
  wb.update(serviceRef, {
    'subscriptions': increment(-1)
  })
  return wb.commit()
}

export function getServiceSubscriptions (token: string, serviceId: number): Promise<Record<string, string>> {
  if (!token || !serviceId) {
    return Promise.reject(new Error('Missing token or serviceId'))
  }

  const q = query(collection(getFirestore(firebase), 'subscriptions'), where('token', '==', token), where('serviceId', '==', serviceId))
  return getDocs(q).then(snap => snap.docs.reduce((acc, doc) => {
    acc[doc.data().locationId] = doc.id
    return acc
  }, {} as Record<string, string>))
}
