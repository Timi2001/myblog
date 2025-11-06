import AdminLayout from '@/components/admin/admin-layout';
import { AuthProvider } from '@/contexts/auth-context';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
}