import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import InvoiceListPage from "@/features/invoices/pages/InvoiceListPage";
import InvoiceDetailsPage from "@/features/invoices/pages/InvoiceDetailsPage";
import InvoiceFormPage from "@/features/invoices/pages/InvoiceFormPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "invoices", element: <InvoiceListPage /> },
          { path: "invoices/new", element: <InvoiceFormPage mode="create" /> },
          { path: "invoices/:id", element: <InvoiceDetailsPage /> },
          {
            path: "invoices/:id/edit",
            element: <InvoiceFormPage mode="edit" />,
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
