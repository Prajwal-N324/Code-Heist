import '../styles/globals.css'
import HeistLayout from '../components/HeistLayout'

export default function App({ Component, pageProps }) {
  return (
    <HeistLayout>
      <Component {...pageProps} />
    </HeistLayout>
  )
}
