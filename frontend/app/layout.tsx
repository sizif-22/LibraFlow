import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

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
    <html lang="en">
      <body 
        className={`${inter.className} antialiased selection:bg-sky-500/30`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="py-8 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
              <p>&copy; 2026 LibraFlow Team. All rights reserved.</p>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
