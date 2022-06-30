import {NextApiRequest, NextApiResponse} from 'next'
import {LocationData} from '../../../../lib/locations/Location'

interface LocationResp {
  id_centro: string
  nombre: string
  direccion: string
}

// Returns all location options for a service provided in param and all appoinments currently available
export default async function getServiceLocationsHandler(
  req: NextApiRequest,
  res: NextApiResponse<LocationData[]>
) {
  if (req.method != 'GET') {
    return res.status(405).setHeader('Allow', ['GET']).end()
  }

  try {
    // TODO Handle if query id array
    const {serviceId} = req.query as { serviceId: string }
    const locations = await getServiceLocations(serviceId)
    return res.status(200).json(locations)
  } catch (err) {
    console.error(err)
    return res.status(500).end()
  }
}

async function getServiceLocations(serviceId: string): Promise<LocationData[]> {
  const locationsResponse = await fetch(serviceLocationsUrl(serviceId), {
    headers: {'Content-Type': 'application/json'},
    method: 'GET',
  })
  if (!locationsResponse.ok) {
    throw new Error()
  }

  // Fetch service locations and transform to LocationData
  const respData: Array<{ centros: Array<LocationResp> }> = await locationsResponse.json()
  const locations = respData[0]?.centros?.map<LocationData>((c) => ({
    id: c.id_centro,
    name: c.nombre,
  }))

  // Find available appointments at all locations for this service
  await Promise.allSettled(locations.map((loc, i) => setLocationAppointments(serviceId as string, locations[i])))
  return locations
}

// A promise that searches and adds available appointments to each location in the provided list
const setLocationAppointments = async (serviceId: string, loc: LocationData): Promise<void> => {
  const resp = await fetch(locationAppointmentsUrl(serviceId, loc.id), {
    headers: {'Content-Type': 'application/json'},
    method: 'GET',
  })

  if (!resp.ok) return

  const respJson = await resp.json()
  // Attach fetched appointments and change id to composite serviceId-locationId to be used as subscription topic
  loc.appointments = respJson.dias
  loc.id = `${serviceId}_${loc.id}`
}

// valencia.es endpoints for service locations and appointments availability
const serviceLocationsUrl = (serviceId: string) =>
  `http://www.valencia.es/qsige.localizador/citaPrevia/centros/servicio/disponible/${serviceId}`
const locationAppointmentsUrl = (serviceId: string, locationId: string) =>
  `http://www.valencia.es/qsige.localizador/citaPrevia/disponible/centro/${locationId}/servicio/${serviceId}/calendario`
