import {captureException, withSentry} from "@sentry/nextjs";
import {FieldValue, getFirestore, QueryDocumentSnapshot} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging"
import {NextApiRequest, NextApiResponse} from "next";
import {getServiceOptions} from "../../lib/service-options";
import admin from "../../utils/firebase-admin";

async function NotifyAppointments(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', ['POST']).end()
  }

  // Get authorization bearer token from request
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).end()
  }

  if (token !== process.env.API_SECRET_KEY) {
    // TODO
    return res.status(403).end()
  }

  try {
    await checkAndNotify()
    console.log('Notified')
    res.status(204).end()
  } catch (err) {
    captureException(err)
    res.status(500).send(err)
  }
}


// Get full appointment check url for service and location
const topicAppointmentsUrl = (location: string, service: string): string => `http://www.valencia.es/qsige.localizador/citaPrevia/disponible/centro/${location}/servicio/${service}/calendario`

async function hasTopicNewAppointments(topic: string, cb: (has: boolean) => void): Promise<void> {
  const [serviceId, locationId] = topic.split('_')

  try {
    const res = await fetch(topicAppointmentsUrl(locationId, serviceId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })

    if (!res.ok) return cb(false);
    const data = await res.json();
    return cb(!!data.dias?.length)
  } catch (error) {
    // Appointment check for a topic failed. valencia.es unreliable API
    // TODO Retry
    return cb(false)
  }
}

async function topicsWithAppointments(topics: Set<string>) {
  const promises: Promise<void>[] = []
  topics.forEach(topic => {
    promises.push(hasTopicNewAppointments(topic, (has: boolean) => !has && topics.delete(topic)))
  })
  await Promise.allSettled(promises)
}

/**
 * Returns a list of topics with devices subscribed to them
 */
async function getActiveSubscribedTopics(): Promise<string[]> {
  return getFirestore(admin)
    .collection('topics')
    .where('active', '>', 0)
    .get()
    .then(snap => snap.docs.map(doc => doc.id))
    .catch(err => {
      captureException(err)
      return []
    })
}

/**
 * Returns a list of subscription records grouped by service
 * @param {Set<string>>} topics
 */
async function subscriptionsByService(topics: Set<string>): Promise<Record<string, QueryDocumentSnapshot[]> | null> {
  try {

    const subscriptionsSnap = await getFirestore(admin)
      .collection('subscriptions')
      .where('topic', 'in', Array.from(topics))
      .get()

    // Summarize by service
    return subscriptionsSnap.docs.reduce((acc: Record<string, QueryDocumentSnapshot[]>, doc) => {
      const serviceId = doc.data().topic.split('_')[0]
      if (!acc[serviceId]) acc[serviceId] = []
      acc[serviceId].push(doc)
      return acc
    }, {} as Record<string, QueryDocumentSnapshot[]>)
  } catch (error) {
    captureException(error)
    return null
  }
}

/**
 * Notifies a set of devices subscribed to topic that has new appointments
 * @param {QueryDocumentSnapshot[]} subscriptions records subscribed to services
 * @param {string} serviceName to use in the notification
 */
async function notifyDevices(subscriptions: QueryDocumentSnapshot[], serviceName: string): Promise<void> {
  // Send multicast message to all devices subscribed to this topic
  const resp = await getMessaging(admin).sendMulticast(makeServiceMessage(serviceName, subscriptions.map(s => s.data().token)))
  console.log({resp})
  // Use batch writes
  // Update topic counters
  // Delete subscription on successful message delivery
  // Delete subscription on invalid token error on delivery
  // Delete subscription if older than two months
  // TODO Handle 3rd paty auth error
  const batch = getFirestore(admin).batch()
  subscriptions.forEach((s, i) => {
    const {error} = resp.responses[i]
    const isDelivered = !error

    if (isDelivered) {
      const topicRef = getFirestore(admin).collection('topics').doc(s.data().topic)
      batch.update(topicRef, {"delivered": FieldValue.increment(1)})
    }

    // Remove subscription if:
    // - Message was delivered
    // - Error is invalid token
    // - Error is token not registered (expired)
    // - Subscriptions older than 60 days
    // TODO handle messaging/third-party-auth-error
    // TODO Handle retries
    const shouldRemove = isDelivered
      || error?.code === 'messaging/invalid-registration-token'
      || error?.code === 'messaging/registration-token-not-registered'
      || s.createTime.toDate().getTime() < Date.now() - 1000 * 60 * 60 * 24 * 30 * 2

    if (shouldRemove) batch.delete(s.ref)
  })

  await batch.commit()
}

/**
 * Check existing mapped subscriptions against complete service list and notify where needed
 * @param {Set<string>} topics
 */
async function notifyTopics(topics: Set<string>): Promise<void> {
  // Fetch all available services and currently active subscriptions for topics with found appointments
  const [serviceList, subscriptions] = await Promise.all([getServiceOptions(), subscriptionsByService(topics)])

  if (!serviceList?.length || !subscriptions) {
    // Try next tick
    return
  }

  // Find subscriptions and notify all devices
  serviceList.forEach(s => {
    const subs = subscriptions[s.id]
    if (!subs) return
    notifyDevices(subs, s.name)
  })
}

/**
 * Constructs a message to be sent to devices
 * @param {string} serviceName to use in message body
 * @param {string[]} tokens representing devices to send message to
 */
function makeServiceMessage(serviceName: string, tokens: string[]): any {
  return {
    tokens,
    notification: {
      title: 'New appointments available',
      body: `Check appointments for ${serviceName}`,
    },
    webpush: {
      headers: {
        urgency: 'high'
      },
      notification: {
        title: 'New appointments available',
        body: `Check appointments for ${serviceName}`,
        icon: 'https://www.valencia.es/qsige.localizador/img/logo.png',
        click_action: 'https://www.valencia.es/cas/tramites/cita-previa/-/content/portada-cita-previa-2020?uid=62073EF0AB33BD52C125857C0039F2BE'
      },
      fcmOptions: {
        link: 'https://www.valencia.es/cas/tramites/cita-previa/-/content/portada-cita-previa-2020?uid=62073EF0AB33BD52C125857C0039F2BE'
      }
    }
  }
}

/**
 * Main function called from the endpoint controller
 * Handles entire process of fetching active topics, sending messages and updating database
 */
async function checkAndNotify(): Promise<void> {
  const topics = new Set(await getActiveSubscribedTopics())

  // Check for all subscribed topics appointments
  // Remove topics with no appointments from set
  await topicsWithAppointments(topics)

  // Most ticks will stop here (when no appointments found for a topic). If any topics have new appointments, we'll notify them.
  // We will need service and location names.
  // TODO Consider storing names instead of fetching here
  if (!topics.size) {
    return
  }
  await notifyTopics(topics)
}

export default withSentry(NotifyAppointments);