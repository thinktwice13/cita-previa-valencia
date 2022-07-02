import {useColorModeValue} from "@chakra-ui/color-mode";
import {Button, Heading, Link, VStack} from "@chakra-ui/react";
import Head from "next/head"
import NextLink from "next/link";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Not Found</title>
      </Head>
      <VStack h={"100vh"} justifyContent={"center"}>
        <Heading size={"3xl"}>404</Heading>
        <Heading size={"md"} color={useColorModeValue('gray.500', 'gray.500')} >Not Found</Heading>
        <NextLink href={"/"} passHref><Button as={Link}>Home</Button></NextLink>
      </VStack>
    </>
  )
}