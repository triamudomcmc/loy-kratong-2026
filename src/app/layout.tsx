import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Maitree, Noto_Sans_Thai } from "next/font/google";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ClientShell } from "@components/ClientShell";
import "./globals.css";

const plexSansThai = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-plex-sans-thai",
});

const maitree = Maitree({
  weight: ["600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-maitree",
});

const notoSansThai = Noto_Sans_Thai({
  weight: ["400", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-noto-sans-thai",
});

const chulaNarak = localFont({
  src: "../../public/assets/fonts/ChulaNarak Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-chula-narak",
});

const title = "ลอยกระทงออนไลน์ 2569";
const description = "ร่วมลอยกระทงออนไลน์ โดยคณะกรรมการงานกิจกรรมพัฒนาผู้เรียน (กช.) โรงเรียนเตรียมอุดมศึกษา";
const url = "https://loykratong.triamudom.club/";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  keywords:
    "เตรียมอุดมศึกษา, กช., ลอยกระทง, สร้างกระทง, ลอยกระทงกับเพื่อน, Loy Kratong, Loy Krathong, ลอยกระทงอยู่บ้าน, ลอยกระทงออนไลน์, 2569, ลอยกระทงออนไลน์ 2569, ลอยกระทงเตรียม, ลอยกระทงเตรียมอุดม, กช. เตรียมอุดม, กช เตรียมอุดม, เตรียม, คณะกรรมการงานกิจกรรมพัฒนาผู้เรียน",
  authors: [{ name: "คณะกรรมการงานกิจกรรมพัฒนาผู้เรียน โรงเรียนเตรียมอุดมศึกษา" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    url,
    title,
    description,
    images: ["/assets/images/banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/images/banner.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1286b1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${plexSansThai.variable} ${maitree.variable} ${chulaNarak.variable} ${notoSansThai.variable}`}>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
      <GoogleAnalytics gaId="G-K3262R253B" />
    </html>
  );
}
