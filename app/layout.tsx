import { ClerkProvider } from '@clerk/nextjs'
import { Urbanist } from 'next/font/google'

import ModalProvider from '@/providers/modal-provider'
import ToastProvider from '@/providers/toast-provider'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import AIDrawer from '@/components/ai-drawer'
import { AIChatPanelProvider } from '@/components/ai-chat-panel-context'
import { AIProvider } from '@/components/ai-context'
import { PageShiftShell } from '@/components/page-shift-shell'

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
    <ClerkProvider>
      <html lang="en">
        <body className={`${font.className} overflow-x-visible`}>
          <AIChatPanelProvider>
            <AIProvider>
              <PageShiftShell>
                <ToastProvider />
                <ModalProvider />
                <Navbar />
                {children}
                <Footer />
              </PageShiftShell>
              <AIDrawer />
            </AIProvider>
          </AIChatPanelProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
