import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@/layouts/public-layout';
import { AdminLayout } from '@/layouts/admin-layout';
import { StudentLayout } from '@/layouts/student-layout';
import { HomePage } from '@/features/public/home-page';
import { AboutPage } from '@/features/public/about-page';
import { RoomsPage as PublicRoomsPage } from '@/features/public/rooms-page';
import { FacilitiesPage } from '@/features/public/facilities-page';
import { AdmissionPage } from '@/features/public/admission-page';
import { NoticesPage as PublicNoticesPage } from '@/features/public/notices-page';
import { ContactPage } from '@/features/public/contact-page';
import { DesignSystemPage } from '@/features/public/design-system-page';
import { LoginPage } from '@/features/auth/login-page';
import { RegisterPage } from '@/features/auth/register-page';
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page';
import { ProtectedRoute } from '@/features/auth/protected-route';

// Admin Feature Modules
import { AdminDashboardPage } from '@/features/admin/admin-dashboard-page';
import { StudentsPage } from '@/features/admin/students-page';
import { AdmissionsPage } from '@/features/admin/admissions-page';
import { RoomsPage as AdminRoomsPage } from '@/features/admin/rooms-page';
import { AllocationsPage } from '@/features/admin/allocations-page';
import { PaymentsPage } from '@/features/admin/payments-page';
import { ExpensesPage } from '@/features/admin/expenses-page';
import { ComplaintsPage } from '@/features/admin/complaints-page';
import { NoticesAdminPage } from '@/features/admin/notices-page';
import { ReportsPage } from '@/features/admin/reports-page';
import { SettingsPage } from '@/features/admin/settings-page';

// Student Panel Modules
import { StudentDashboardPage } from '@/features/student/student-dashboard-page';
import { StudentProfilePage } from '@/features/student/student-profile-page';
import { StudentRoomPage } from '@/features/student/student-room-page';
import { StudentPaymentsPage } from '@/features/student/student-payments-page';
import { StudentComplaintsPage } from '@/features/student/student-complaints-page';
import { StudentNoticesPage } from '@/features/student/student-notices-page';
import { StudentRulesPage } from '@/features/student/student-rules-page';
import { StudentSecurityPage } from '@/features/student/student-security-page';

export const router = createBrowserRouter([
  // Public Routes Shell
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'rooms',
        element: <PublicRoomsPage />,
      },
      {
        path: 'facilities',
        element: <FacilitiesPage />,
      },
      {
        path: 'admission',
        element: <AdmissionPage />,
      },
      {
        path: 'notices',
        element: <PublicNoticesPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'design-system',
        element: <DesignSystemPage />,
      },
    ],
  },
  // Auth Routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  // Admin Panel Routes (Protected: Admin Only)
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="ADMIN" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'students',
            element: <StudentsPage />,
          },
          {
            path: 'admissions',
            element: <AdmissionsPage />,
          },
          {
            path: 'rooms',
            element: <AdminRoomsPage />,
          },
          {
            path: 'allocations',
            element: <AllocationsPage />,
          },
          {
            path: 'payments',
            element: <PaymentsPage />,
          },
          {
            path: 'expenses',
            element: <ExpensesPage />,
          },
          {
            path: 'complaints',
            element: <ComplaintsPage />,
          },
          {
            path: 'notices',
            element: <NoticesAdminPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  // Student Panel Routes (Protected: Student Only)
  {
    path: '/student',
    element: <ProtectedRoute requiredRole="STUDENT" />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          {
            index: true,
            element: <StudentDashboardPage />,
          },
          {
            path: 'profile',
            element: <StudentProfilePage />,
          },
          {
            path: 'room',
            element: <StudentRoomPage />,
          },
          {
            path: 'payments',
            element: <StudentPaymentsPage />,
          },
          {
            path: 'complaints',
            element: <StudentComplaintsPage />,
          },
          {
            path: 'notices',
            element: <StudentNoticesPage />,
          },
          {
            path: 'rules',
            element: <StudentRulesPage />,
          },
          {
            path: 'security',
            element: <StudentSecurityPage />,
          },
        ],
      },
    ],
  },
  // Fallback Route
  {
    path: '*',
    element: (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">৪০৪</h1>
        <p className="text-gray-600 mb-4">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</p>
        <a href="/" className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium">
          হোমে ফিরে যান
        </a>
      </div>
    ),
  },
]);
