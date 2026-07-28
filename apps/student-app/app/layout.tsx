import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from '@mathlers/ui/ThemeProvider';
import { getSiteTheme } from '@mathlers/lib/theme/site';

export const metadata: Metadata = {
  title: "Mathlers",
  description: "Mathematics learning, practice, and competition platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getSiteTheme();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ClerkProvider afterSignOutUrl="/landing">
          <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
