import { Geist, Geist_Mono, Pacifico, Roboto, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400", 
  variable: "--font-pacifico", 
});


const roboto = Roboto({
  subsets: ["latin"],
  weight: "400", 
  variable: "--font-roboto", 
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: "400", 
  variable: "--font-oswald", 
});

export const metadata = {
  title: "Rayhan's Movie Server | Stream HD Movies & TV Shows",
  description: "Experience seamless 4K streaming with Rayhan's Movie Server. Explore a vast library of latest blockbusters, trending TV series, and personalized watchlists with lightning-fast performance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${pacifico.variable} ${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
