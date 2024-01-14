import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Text,
} from '@chakra-ui/react'
import {useRef} from 'react'
import PropTypes from "prop-types";

type TryAgainLaterProps = {
    isVisible?: boolean
    text?: string
}

/** Visible when there is an error fetching initial list data: service and locations */
function TryAgainLater({isVisible, text}: Readonly<TryAgainLaterProps>): JSX.Element | null {
    const cancelRef = useRef<HTMLButtonElement>(null)

    if (!isVisible) return null

    return (
        <AlertDialog isOpen={isVisible} leastDestructiveRef={cancelRef} onClose={() => null} isCentered>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Problem Retrieving Services
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <Text>
                            Failed to retrieve services from{' '}
                            <a
                                target="_blank"
                                rel="noreferrer noreferrer”"
                                href="https://www.valencia.es/es/cas/tramites/cita-previa/-/content/portada-cita-previa-2020?uid=62073EF0AB33BD52C125857C0039F2BE"
                            >
                                <strong>valencia.es</strong>
                            </a>
                            {text}
                        </Text>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button width={'full'} colorScheme="red" onClick={() => window.location.reload()} ml={3}>
                            Reload
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}

TryAgainLater.propTypes = {
    isVisible: PropTypes.bool,
    text: PropTypes.string,
}

TryAgainLater.defaultProps = {
    text: 'Could not retrieve data',
}

export default TryAgainLater
