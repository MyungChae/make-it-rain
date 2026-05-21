import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Make It Rain — 60초 캐주얼 클릭 게임",
  description: "하늘에서 떨어지는 돈을 잡아라! 비누방울을 피하며 60초 동안 최고 점수에 도전하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
