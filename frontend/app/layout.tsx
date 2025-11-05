'use client';

import "./globals.css";
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import { ToastContainer } from '@/components/ui/Toast';
import { useToastStore } from '@/lib/hooks/useToast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { toasts } = useToastStore();

  return (
    <html lang="en">
      <head>
        <title>Horizon Techfolio - Portfolio Management</title>
        <meta name="description" content="Technical Analysis Portfolio Management System" />
      </head>
      <body className="font-sans">
        {children}
        <ToastContainer toasts={toasts} />
      </body>
    </html>
  );
}
