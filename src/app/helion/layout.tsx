import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Helion',
  description: 'Your solar business. Supercharged.',
  icons: {
    icon: '/icon',
  },
}

export default function HelionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="helion-layout">
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide any global headers that might still appear */
          header:not([data-landing-header]) {
            display: none !important;
          }
          /* Ensure no global navigation appears */
          nav:not([data-landing-nav]) {
            display: none !important;
          }
          /* Hide global footer for this route */
          footer {
            display: none !important;
          }
          /* Inter font class */
          .font-inter {
            font-family: var(--font-inter), Inter, sans-serif;
          }
        `
      }} />
      {children}
    </div>
  )
}
