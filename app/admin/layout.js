import Sidebar from '@/components/admin/Sidebar';
import AdminProgressBar from '@/components/admin/AdminProgressBar';

export const metadata = {
  title: "Admin Panel | MovieServer PRO",
};

export default function AdminLayout({ children }) {
  return (
    <div className="bg-gray-50 flex min-h-screen">
      <AdminProgressBar />
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
