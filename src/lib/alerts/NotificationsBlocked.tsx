import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button
} from '@chakra-ui/react'
import {useRef} from 'react'
import {useMessaging} from "../messaging";

export default function NotificationsBlocked() {
  const {isDenied} = useMessaging()
  const cancelRef = useRef<HTMLButtonElement>(null)
  return (
    <AlertDialog isOpen={isDenied} leastDestructiveRef={cancelRef} onClose={() => null} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Push Notifications Disabled
          </AlertDialogHeader>

          <AlertDialogBody>
            To subscribe, enable push notifications for this website and reload the page
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
