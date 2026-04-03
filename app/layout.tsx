import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "ChatPro – Real-time Communication Platform",
  description: "Private chat, public rooms, and secured meeting spaces — all in one platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full bg-white text-gray-900 antialiased">
        <ClerkProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'dark:bg-zinc-900 dark:text-white glassmorphism border border-gray-200 dark:border-zinc-800 rounded-[20px] shadow-2xl',
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#18181b',
                backdropFilter: 'blur(20px)',
                borderRadius: '100px',
                padding: '12px 24px',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.02em',
              },
              success: {
                iconTheme: { primary: '#3b82f6', secondary: '#fff' }
              }
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}
