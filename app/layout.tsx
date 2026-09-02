import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from '@/context/SessionContext';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: {
    default: 'HAWA — Wear the weather.',
    template: '%s | HAWA',
  },
  description:
    'Breathable cotton and linen essentials cut for Indian weather. Free shipping over ₹1,499, easy returns, Cash on Delivery available.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const clientSession = session
    ? { id: session.sub, name: session.name, email: session.email, role: session.role }
    : null;

  return (
    <html lang="en">
      <body>
        <SessionProvider session={clientSession}>
          <CartProvider>{children}</CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
