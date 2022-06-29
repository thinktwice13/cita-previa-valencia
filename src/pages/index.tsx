import {Box, Heading, Stack} from "@chakra-ui/react";
import type { NextPage } from 'next'
import Service from "../lib/services/Service"

const services = [
  { name: 'service', id: '1' },
  { name: 'service', id: '2' },
  { name: 'service', id: '3' },
  { name: 'service', id: '4' },
  { name: 'service', id: '5' }
]


const Home: NextPage = () => {
  return (
    <Box>
    <Heading>CPV</Heading>
      <Stack>
        {services?.map(service => <Service key={service.id} id={+service.id} name={service.name}/>)}
      </Stack>
    </Box>
  )
}

export default Home
