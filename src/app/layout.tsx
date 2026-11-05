
import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Hostlio - Find Your Perfect Room",
  description: "Hostlio is your ultimate platform for finding the perfect room. Whether you're a student, professional, or traveler, we connect you with a wide range of rooms to suit your needs. Explore our listings, connect with landlords, and find your ideal living space today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-white text-brand-text-primary min-h-screen">
        <AuthProvider>
          {children}
          <BottomNav />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
