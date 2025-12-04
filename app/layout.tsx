import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "Sinai Climbing",
  description: "Interface to the database of all climbing routes in Egypt",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
