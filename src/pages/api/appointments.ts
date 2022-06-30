import {FieldValue, getFirestore, QueryDocumentSnapshot} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging"
import {NextApiRequest, NextApiResponse} from "next";
import {getServiceOptions} from "../../lib/service-options";
import admin from "../../utils/firebase-admin";

export default async function NotifyAppointments(req: NextApiRequest, res: NextApiResponse) {
  // if (req.method != 'POST') {
  //   return res.status(405).setHeader('Allow', ['GET']).end()
  // }

  try {
    await checkAndNotify()
  } catch (err) {
    console.error(err)
  } finally {
    res.status(204).end()
  }
}


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
    console.error('Error fetching topic appointments!', error) // TODO serverless logging
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
 * Returns a list of topics that have devices subscribed to them
 */
async function getActiveSubscribedTopics(): Promise<string[]> {
  return getFirestore(admin)
    .collection('topics')
    .where('active', '>', 0)
    .get()
    .then(snap => snap.docs.map(doc => doc.id))
}

/**
 * Returns a list of subscription records grouped by service
 * @param {Set<string>>} topics
 */
async function subscriptionsByService(topics: Set<string>): Promise<Record<string, QueryDocumentSnapshot[]>> {
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
}

/**
 * Notifies a set of devices subscribed to topic that has new appointments
 * @param {QueryDocumentSnapshot[]} subscription records subscribed to services
 * @param {string} serviceName to use in the notification
 */
async function notifyDevices(subscriptions: QueryDocumentSnapshot[], serviceName: string): Promise<void> {
  // Send multicast message to all devices subscribed to this topic
  const resp = await getMessaging(admin).sendMulticast(makeServiceMessage(serviceName, subscriptions.map(s => s.data().token)))

  // Use batch writes
  // Update topic counters
  // Delete subscription on successful message delivery
  // Delete subcription on invalid token error on delivery
  // Delete sbscription if older than two months
  // TODO Handle 3rd paty auth error
  const batch = getFirestore(admin).batch()
  subscriptions.forEach((s, i) => {
    const { error } = resp.responses[i]
    const isDelivered = !error

    if (isDelivered) {
      const topicRef = getFirestore(admin).collection('topics').doc(s.data().topic)
      batch.update(topicRef, {"delivered": FieldValue.increment(1)})
    }


    // TODO log error
    // TODO handle messaging/third-party-auth-error
    // TODO Handle retries
    const olderThanTwoMonths = s.createTime.toDate().getTime() < Date.now() - 1000 * 60 * 60 * 24 * 30 * 2
    console.log({s, isDelivered, error, info: error?.code, olderThanTwoMonths})
    const shouldRemove = isDelivered || olderThanTwoMonths || error?.code === 'messaging/invalid-registration-token' || error?.code === 'messaging/registration-token-not-registered'
    if (shouldRemove) {
      console.log("Should remove!")
      // batch.delete(s.ref)
    }
  })

  await batch.commit()
}

/**
 * Check existing mapped subscriptions against complete service list and notify where needed
 * @param {Set<string>} topics
 */
async function notifyTopics(topics: Set<string>): Promise<void> {
  const [serviceList, subscriptions] = await Promise.all([getServiceOptions(), subscriptionsByService(topics)])
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

  await topicsWithAppointments(topics)
  // Most ticks will stop here. If any topics have new appointments, we'll notify them.
  // We will need service and location names.
  // TODO Consider storing names instead of fetching here
  if (!topics.size) {
    return
  }
  await notifyTopics(topics)
}