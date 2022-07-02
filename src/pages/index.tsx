import {Stack} from "@chakra-ui/react";
import {captureException, captureMessage} from "@sentry/nextjs";
import type {GetStaticProps, GetStaticPropsResult, InferGetStaticPropsType, NextPage} from 'next'
import Head from "next/head";
import NotificationsBlocked from "../lib/alerts/NotificationsBlocked";
import PushNotSupported from "../lib/alerts/PushNotSupported";
import TryAgainLater from "../lib/alerts/TryAgainLater";
import Footer from "../lib/Footer"
import Header from "../lib/Header";
import Service, {ServiceData} from "../lib/Service"
import {getServiceOptions} from "../lib/service-options";

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

export const getStaticProps: GetStaticProps = async (): Promise<GetStaticPropsResult<{ services: ServiceData[] }>> => {
  const twentyFourHoursInSecs = 24 * 60 * 60
  try {
    const services = await getServiceOptions()
    if (services.length == 0) {
      captureMessage("failed to revalidate available services", "info")
      throw new Error()
    }

    return {revalidate: 3 * twentyFourHoursInSecs, props: {services}}
  } catch (err) {
    captureException(err)
    return {revalidate: twentyFourHoursInSecs, props: {services: []}}
  }
}

export default Home
