import './globals.css';
import Nav from './nav';
export const metadata = { title: 'MIRZA | Luxury Analog Watches', description: 'Timeless elegance. Extraordinary precision.' };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><Nav />{children}</body></html>);
}
