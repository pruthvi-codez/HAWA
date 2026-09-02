import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/models/orders';
import AdminOrderDetail from '@/components/admin/AdminOrderDetail';

export const metadata = { title: 'Admin — Order Detail' };

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = getOrderById(params.id);
  if (!order) notFound();
  return <AdminOrderDetail order={order} />;
}
