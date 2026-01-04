import { ClientProviders } from "@/src/presentation/components/ui/ClientProviders";
import { ThemeProvider } from "@/src/presentation/components/ui/ThemeProvider";
import type { Metadata } from "next";
import "../public/styles/index.css";

export const metadata: Metadata = {
  title: "AI Content Creator | Pixel Art Generator",
  description: "สร้างคอนเทนต์ Pixel Art อัตโนมัติด้วย AI Gemini - Generate และโพสต์ตาม schedule",
  keywords: ["AI", "Content Creator", "Pixel Art", "Automation", "Gemini", "Thai"],
  authors: [{ name: "AI Content Creator" }],
  creator: "AI Content Creator",
  openGraph: {
    type: "website",
    locale: "th_TH",
    title: "AI Content Creator",
    description: "สร้างคอนเทนต์ Pixel Art อัตโนมัติด้วย AI",
    siteName: "AI Content Creator",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Content Creator",
    description: "สร้างคอนเทนต์ Pixel Art อัตโนมัติด้วย AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
