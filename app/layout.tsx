import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header, Footer, MotionProvider } from '@/components/site';
const inter=Inter({subsets:['latin'],display:'swap'});
export const metadata:Metadata={title:{default:'Revana® — Spaces for living.',template:'%s — Revana®'},description:'Thoughtful architecture, interiors, and landscapes. Explore the Revana studio demonstration portfolio.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={inter.className}><MotionProvider><a className="skip" href="#main">Skip to content</a><Header/>{children}<Footer/></MotionProvider></body></html>}
