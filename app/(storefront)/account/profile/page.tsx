import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/models/users';
import ProfileForm from '@/components/ProfileForm';

export const metadata = { title: 'Profile Settings' };

export default async function ProfilePage() {
  const session = await getSession();
  const user = getUserById(session!.sub)!;
  return <ProfileForm initial={{ name: user.name, email: user.email, phone: user.phone || '' }} />;
}
