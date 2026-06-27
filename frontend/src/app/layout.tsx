import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BackgroundImage from "./(page)/BackgroundImage";


export const metadata: Metadata = {
  title: "MENAR",
  description: "Created by Furkan Ercan & Duhan Ercan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="min-h-[90vh] relative">
          <BackgroundImage />
          {children}
        </main>
      </body>
    </html>
  );
}
