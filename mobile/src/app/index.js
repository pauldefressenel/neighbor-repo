import { Redirect } from 'expo-router'

// Same default as the website: `/` opens the English edition.
export default function Index() {
  return <Redirect href="/en" />
}
