import { useEffect } from 'react'
import { useColorScheme } from 'sanity'

export function ForceLightScheme(props) {
  const { setScheme } = useColorScheme()
  useEffect(() => { setScheme('light') }, [setScheme])
  return props.renderDefault(props)
}
