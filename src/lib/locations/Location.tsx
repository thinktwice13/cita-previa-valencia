import { Flex, Switch, Text } from '@chakra-ui/react'

interface LocationProps {
  name: string;
  onToggle: () => void
  isSubscribed?: boolean
  isDisabled?: boolean
}

function Location (props: LocationProps) {
  return (
    <Flex justifyContent={'space-between'} alignItems={'center'}>
      <Text>{props.name}</Text>
      <Switch isChecked={!!props.isSubscribed} onChange={props.onToggle} isDisabled={!!props.isDisabled}/>
    </Flex>
  )
}

export default Location
