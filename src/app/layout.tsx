import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BusinessCase — Case Store",
  description: "SaaS-платформа для промтов и бизнес-кейсов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
