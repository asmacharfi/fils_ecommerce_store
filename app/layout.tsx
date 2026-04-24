import { ClerkProvider } from "@clerk/nextjs";
import { enUS } from "@clerk/localizations";
import { Urbanist } from "next/font/google";

import { CLERK_UI_ENABLED } from "@/lib/clerk-public";
import { ChatSessionTokenBridge } from "@/lib/chat-clerk-session";
import ModalProvider from "@/providers/modal-provider";
import ToastProvider from "@/providers/toast-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AIDrawer from "@/components/ai-drawer";
import { AIChatPanelProvider } from "@/components/ai-chat-panel-context";
import { AIProvider } from "@/components/ai-context";
import { PageShiftShell } from "@/components/page-shift-shell";

import "./globals.css";

const font = Urbanist({ subsets: ["latin"] });

export const metadata = {
  title: "Store",
  description: "E-commerce with a shopping assistant and personalized picks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = (
    <html lang="en-US">
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
            {CLERK_UI_ENABLED ? <ChatSessionTokenBridge /> : null}
            <AIDrawer />
          </AIProvider>
        </AIChatPanelProvider>
      </body>
    </html>
  );

  return CLERK_UI_ENABLED ? (
    <ClerkProvider localization={enUS}>{tree}</ClerkProvider>
  ) : (
    tree
  );
}
