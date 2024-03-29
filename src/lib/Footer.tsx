import {useColorModeValue} from '@chakra-ui/color-mode'
import {Box, HStack, Link, Stack, Text} from '@chakra-ui/react'
import NextLink from 'next/link'
import NotificationsDelivered from "./NotificationsDelivered";

type FooterLinkProps = { to: string; label: string }
const FooterLink = ({to, label}: FooterLinkProps) => {
    return (
        <NextLink href={to} passHref>
            <Link
                color={useColorModeValue('gray.500', 'gray.400')}
                fontWeight="700"
                transition="none"
                _hover={{
                    textDecor: 'none',
                    color: 'steelblue',
                    transition: 'none',
                }}
            >
                {label}
            </Link>
        </NextLink>
    )
}

// Displays links to Privacy and Terms pages, link to valencia.es appointment signup page and total count of delivered notifications
// TODO style for bigger screens
const Footer = () => {
    return (
        <Stack alignItems={["center", null, "baseline"]} direction={["column", null, "row"]}
               justifyContent={["space-between"]} spacing={[4]} pb={4} pt={[2, null, 8]} fontSize={14} px={8}>
            <Text textAlign={"center"} fontWeight="700" color={useColorModeValue('gray.500', 'gray.400')} pt={12}>
                From{" "}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.valencia.es/cas/tramites/cita-previa/-/content/portada-cita-previa-2020?uid=62073EF0AB33BD52C125857C0039F2BE"
                >
                    <Box
                        _hover={{
                            textDecor: 'none',
                            color: useColorModeValue('orange.600', 'orange.500'),
                            transition: 'none',
                        }}
                        fontWeight="700"
                        as="span"
                        color={useColorModeValue('orange.500', 'orange.400')}
                    >
                        www.valencia.es
                    </Box>
                </a>
            </Text>

            <NotificationsDelivered/>

            <HStack justifyContent={"center"}>
                <FooterLink to="/privacy" label="Privacy"/>
                <FooterLink to="/terms" label="Terms"/>
            </HStack>
        </Stack>
    )
}

export default Footer
