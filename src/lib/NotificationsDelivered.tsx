import {useColorModeValue} from "@chakra-ui/color-mode";
import {Text} from "@chakra-ui/react";
import {getFirestore} from "@firebase/firestore";
import {collection, getDocs} from "firebase/firestore";
import {useEffect, useState} from "react";
import firebase from "../utils/firebase";

// Shows total count of delivered notifications across all services
function NotificationsDelivered() {
  const [count, setCount] = useState<number>(0)
  const textColor = useColorModeValue('gray.500', 'gray.500')

  useEffect(() => {
    getDocs(collection(getFirestore(firebase), 'services'))
      .then(snap => {
        // TODO reduce + typescript
        let count = 0
        snap.forEach(doc => count += doc.data().delivered)
        return count
      })
      .then(setCount)
      .catch(console.error).catch(console.error)
  }, [])

  if (count == 0) return null

  return <Text
    textAlign="center"
    fontSize={14}
    fontWeight="500"
    color={textColor}
  >Notifications delivered: <strong>{count}</strong></Text>
}

export default NotificationsDelivered
