import { getSession } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-bone">
      <AdminSidebar adminName={session?.name || 'Admin'} />
      <main className="min-w-0 flex-1 overflow-x-hidden p-6 sm:p-8">{children}</main>
    </div>
  );
}
