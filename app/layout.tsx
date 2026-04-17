import { Urbanist } from 'next/font/google'

import ModalProvider from '@/providers/modal-provider'
import ToastProvider from '@/providers/toast-provider'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import AIDrawer from '@/components/ai-drawer'
import { AIProvider } from '@/components/ai-context'

import './globals.css'

const font = Urbanist({ subsets: ['latin'] })

export const metadata = {
  title: 'Store',
  description: 'Store - The place for all your purchases.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <AIProvider>
          <ToastProvider />
          <ModalProvider />
          <Navbar />
          {children}
          <Footer />
          <AIDrawer />
        </AIProvider>
      </body>
    </html>
  )
}
