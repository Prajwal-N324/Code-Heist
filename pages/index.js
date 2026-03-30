import Head from 'next/head'
import Link from 'next/link'

export default function Gateway() {
  return (
    <>
      <Head>
        <title>Code Heist Gateway</title>
        <meta
          name="description"
          content="Enter the Code Heist system or access admin controls for festival deployment."
        />
      </Head>

      <section className="gateway-page">
        <div className="top-right-link">
          <Link href="/admin" className="ghost-btn small-btn">
            ADMIN ACCESS
          </Link>
        </div>

        <div className="gateway-card">
          <p className="eyebrow">GATEWAY</p>
          <h1>ENTER THE CODE HEIST</h1>
          <p>
            Slip through the player entrance to join the festival challenge, or use the admin route to manage
            live operations.
          </p>

          <div className="gateway-actions">
            <Link href="/login" className="primary-btn">
              ENTER SYSTEM
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
