import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { LocationData } from '../../../../lib/locations/Location'

interface LocationResp {
  id_centro: string
  nombre: string
  direccion: string
}

const serviceLocationsUrl = (serviceId: string) =>
  `http://www.valencia.es/qsige.localizador/citaPrevia/centros/servicio/disponible/${serviceId}`
const locationAppointmentsUrl = (serviceId: string, locationId: string) =>
  `http://www.valencia.es/qsige.localizador/citaPrevia/disponible/centro/${locationId}/servicio/${serviceId}/calendario`

const getServiceLocationsHandler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<LocationData[]>
) => {
  if (req.method != 'GET') {
    return res.status(405).setHeader('Allow', ['GET']).end()
  }

  try {
    // TODO Handle if query id array
    const { serviceId } = req.query
    const locationsResponse = await fetch(serviceLocationsUrl(serviceId as string))
    if (!locationsResponse.ok) {
      throw new Error()
    }

    const respData: Array<{ centros: Array<LocationResp> }> = await locationsResponse.json()
    const locations = respData[0]?.centros?.map<LocationData>((c) => ({
      id: c.id_centro,
      name: c.nombre,
    }))

    await Promise.allSettled(locations.map((loc, i) => setLocationAppointments(serviceId as string, locations[i])))
    return res.status(200).json(locations)
  } catch (err) {
    console.error(err)
    return res.status(500).end()
  }
}

const setLocationAppointments = (serviceId: string, loc: LocationData): Promise<void> => {
  console.log('setting appointments for', serviceId)
  return fetch(locationAppointmentsUrl(serviceId, loc.id))
    .then((resp) => {
      if (!resp.ok) throw new Error()
      return resp.json()
    })
    .then((data) => {
      loc.appointments = data.dias
      return
    })
}

export default getServiceLocationsHandler
