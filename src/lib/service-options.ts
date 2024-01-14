import {captureException} from "@sentry/nextjs";
import {ServiceData} from "./Service";

interface ServiceResponse {
  id_servicio: string
  nombre: string
}

const servicesUrl = 'https://www.valencia.es/qsige.localizador/citaPrevia/servicios/disponibles/'

export function getServiceOptions(): Promise<ServiceData[]> {
  return fetch(servicesUrl, {
    headers: {'Content-Type': 'application/json'},
    method: 'GET',
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(resp.status.toString())
      }
      return resp.json()
    })
    .then(res => {
      return res.reduce((acc: ServiceData[], svc: ServiceResponse) => [...acc, {
        id: svc.id_servicio,
        name: svc.nombre
      }], [])
    }).catch(err => {
      captureException(err)
      return []
    })
}
