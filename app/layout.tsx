import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";

export const metadata: Metadata = {
  title: "Matching Event Ops Manager",
  description: "婚活イベントなどの運営管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
