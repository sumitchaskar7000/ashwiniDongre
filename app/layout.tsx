import type { Metadata } from 'next';
import {studio,studioCopy} from '@/lib/content';
import { Inter } from 'next/font/google';
import './globals.css';
import './motion.css';
import './brand.css';
import { Header, Footer, MotionProvider } from '@/components/site';
const inter=Inter({subsets:['latin'],display:'swap'});
export const metadata:Metadata={title:{default:studio.name+' — Vision To Realty',template:'%s — '+studio.name},description:studioCopy.headline+' Full home interior design to execution in Pune.',icons:{icon:studio.mark}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={inter.className}><MotionProvider><a className="skip" href="#main">Skip to content</a><Header/>{children}<Footer/></MotionProvider></body></html>}
