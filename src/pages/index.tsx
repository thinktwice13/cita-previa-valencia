import {Container, Stack} from "@chakra-ui/react";
import type {GetStaticProps, GetStaticPropsResult, InferGetStaticPropsType, NextPage} from 'next'
import Head from "next/head";
import Header from "../lib/Header";
import {PushNotSupported} from "../lib/PushNotSupported";
import Service from "../lib/services/Service"
import {TryAgainLater} from "../lib/TryAgainLater";

const Home: NextPage = (props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  return (
    <div>
      <Head>
        <title>Cita Previa Valencia</title>
        <meta name="description" content="Find appointment slots for city hall sertvices in Valencia, Spain"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main>
        <Container px={[1, 2, 3]} maxW="1000px" pt={[8, 10, 12]}>
          <Header/>
          <Stack>
            <TryAgainLater isVisible={!props.services?.length}/>
            <PushNotSupported/>
            {props.services?.map(service => <Service key={service.id} id={service.id} name={service.name}/>)}
          </Stack>
        </Container>
      </main>
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

const servicesUrl = 'http://www.valencia.es/qsige.localizador/citaPrevia/servicios/disponibles/'

function getServiceOptions(): Promise<ServiceData[]> {
  return fetch(servicesUrl)
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(resp.status.toString())
      }
      return resp.json()
    })
    .then(res => {
      return res.reduce((acc, svc) => [...acc, {id: svc.id_servicio, name: svc.nombre}], [])
    })
}

export default Home
