import type { Metadata } from 'next';
import '@fontsource/bodoni-moda/900.css';
import './globals.css';
export const metadata: Metadata = {title:'Harrison Ferraro — Selected works',description:'Figurative and abstract paintings by Melbourne artist Harrison Ferraro.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-AU"><body>{children}</body></html>}
