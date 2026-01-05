import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMSAT E-Sign | Sistem Tanda Tangan Elektronik",
  description: "Sistem tanda tangan elektronik dengan standar keamanan tinggi untuk verifikasi dokumen digital.",
  keywords: ["tanda tangan elektronik", "e-signature", "verifikasi dokumen", "digital signature"],
  authors: [{ name: "AMSAT E-Sign Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
