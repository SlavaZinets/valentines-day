import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Валентинка 💖",
  description: "Романтична інтерактивна валентинка українською мовою",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="antialiased">{children}</body>
    </html>
  );
}
