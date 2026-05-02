import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LibraFlow | University Library Management",
  description: "Efficiently manage library resources and borrowings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("bg-black", "font-sans", geist.variable)}>
      <body 
        className={`${inter.className} antialiased bg-black text-white`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <SmoothScroll>
            <div className="min-h-screen flex flex-col bg-black">
              <Navbar />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
            </div>
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}

