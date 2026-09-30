import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Household | Chairman House",
  description:
    "Daily duties and maintenance, in one simple household workspace.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
