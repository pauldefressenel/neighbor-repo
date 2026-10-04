import { Redirect } from 'expo-router'

// The app serves the French edition only for now; English comes later.
export default function Index() {
  return <Redirect href="/fr" />
}
