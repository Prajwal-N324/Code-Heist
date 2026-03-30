import Head from 'next/head'

export default function HeistLayout({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
      <div className="heist-shell">
        <div className="laser-floor" />
        <div className="scanlines" />
        <div className="particle-layer" />
        <div className="background-glow" />
        <div className="heist-content">{children}</div>
      </div>
    </>
  )
}
