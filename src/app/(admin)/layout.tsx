import EnrollmentGate from '@/components/common/EnrollmentGate';
import { ConfirmModal, ToastContainer } from '@/components/ui';
import { Header, Sidebar } from '@/layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnrollmentGate>
      <div className="flex max-h-screen min-h-screen pb-4">
        {/* Sidebar and Backdrop */}
        <Sidebar />

        <div className="mx-auto flex w-full flex-1 flex-col">
          <Header />

          {/* Main Content */}
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </div>
      <ToastContainer />
      <ConfirmModal />
    </EnrollmentGate>
  );
}
