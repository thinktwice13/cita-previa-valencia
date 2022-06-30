import {Stack} from "@chakra-ui/react";
import type {GetStaticProps, GetStaticPropsResult, InferGetStaticPropsType, NextPage} from 'next'
import Head from "next/head";
import NotificationsBlocked from "../lib/alerts/NotificationsBlocked";
import PushNotSupported from "../lib/alerts/PushNotSupported";
import TryAgainLater from "../lib/alerts/TryAgainLater";
import Footer from "../lib/Footer"
import Header from "../lib/Header";
import Service from "../lib/Service"

const Home: NextPage = (props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  return (
    <div>
      <Head>
        <title>Cita Previa Valencia</title>
        <meta name="description" content="Find appointment slots for city hall sertvices in Valencia, Spain"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <Header/>
      <Stack>
        <PushNotSupported/>
        <NotificationsBlocked/>
        {props.services?.map((s: ServiceData) => <Service key={s.id} id={s.id} name={s.name}/>)}
        <Footer/>
      </Stack>

      <TryAgainLater isVisible={!props.services?.length}/>
    </div>
  )
}

interface ServiceData {
  id: string
  name: string
}

export const getStaticProps: GetStaticProps = async (): Promise<GetStaticPropsResult<{ services: ServiceData[] }>> => {
  const twentyFourHoursInSecs = 24 * 60 * 60
  try {
    const services = await getServiceOptions()
    if (services.length == 0) {
      throw new Error('failed to fetch services')
    }

    return {revalidate: 3 * twentyFourHoursInSecs, props: {services}}
  } catch (err) {
    console.log(err)
    return {revalidate: twentyFourHoursInSecs, props: {services: []}}
  }
}

interface ServiceResponse {
  id_servicio: string
  nombre: string
}

const servicesUrl = 'http://www.valencia.es/qsige.localizador/citaPrevia/servicios/disponibles/'

function getServiceOptions(): Promise<ServiceData[]> {
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
    })
}

export default Home
