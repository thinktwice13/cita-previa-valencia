import {Alert, AlertDescription, AlertIcon, AlertTitle} from "@chakra-ui/alert";
import {Box} from "@chakra-ui/layout";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure
} from '@chakra-ui/react'
import {useEffect, useRef} from 'react'
import {useMessaging} from "../messaging";

export default function NotificationsBlocked() {
  const {isDenied} = useMessaging()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const prevIsDeniedRef = useRef(isDenied)
  const {isOpen, onOpen, onClose} = useDisclosure()

  useEffect(() => {
    // Only show the dialog if the user has denied notifications for the first time
    !prevIsDeniedRef.current && isDenied && onOpen()
  }, [isDenied])

  const title = "Push Notifications Disabled"
  const desc = "To subscribe for a notification, enable browser push notifications for this website"

  return (
    <>
      {!isOpen && isDenied &&
          <Alert status="warning" variant="solid" borderRadius={8}>
            <AlertIcon/>
            <Box flex="1">
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription display="block">{desc}</AlertDescription>
            </Box>
          </Alert>
      }

      <AlertDialog isOpen={isOpen && isDenied} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">{title}</AlertDialogHeader>
            <AlertDialogBody>{desc}</AlertDialogBody>
            <AlertDialogFooter>
              <Button id="close-alert" width={'full'} colorScheme="red" onClick={() => window.location.reload()}
                      ml={3}>Close</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
