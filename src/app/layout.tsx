"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { BookProvider } from "@/context/BookContext";
import "./globals.css";
import { useEffect } from "react";
import { toggleTheme } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    async function fetchTheme() {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        toggleTheme(savedTheme);
      }
    }
    fetchTheme();
  }, []);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BookProvider>{children}</BookProvider>
      </body>
    </html>
  );
}
