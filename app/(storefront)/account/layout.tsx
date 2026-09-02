import AccountNav from '@/components/AccountNav';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-3xl font-black uppercase tracking-tight">My Account</h1>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
