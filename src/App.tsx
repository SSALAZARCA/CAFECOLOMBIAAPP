import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Finca from "@/pages/Finca";
import Insumos from "@/pages/Insumos";
import MIP from "@/pages/MIP";
import AlertasIA from "@/pages/AlertasIA";
import OptimizacionIA from "@/pages/OptimizacionIA";
import AnalisisMercado from "@/pages/AnalisisMercado";
import Traceability from "@/pages/Traceability";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCoffeeGrowers from "@/pages/admin/AdminCoffeeGrowers";
import AdminFarms from "@/pages/admin/AdminFarms";
import AdminSubscriptionPlans from "@/pages/admin/AdminSubscriptionPlans";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminReports from "@/pages/admin/AdminReports";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminAudit from "@/pages/admin/AdminAudit";
import AdminSecurity from "@/pages/admin/AdminSecurity";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminProfile from "@/pages/admin/AdminProfile";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { PERMISSIONS } from "@/hooks/usePermissions";
import NotificationCenter from "./components/NotificationCenter";
import ErrorBoundary from "./components/ErrorBoundary";

import { Toaster } from "sonner";
import Configuracion from "@/pages/Configuracion";
import Workers from "@/pages/Workers";

export default function App() {
  useEffect(() => {
    console.log('✅ Aplicación iniciada correctamente');
  }, []);

  return (
    <Router>
      <div className="relative">
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <Landing />
            </ErrorBoundary>
          } />
          <Route path="/app" element={
            <ErrorBoundary>
              <Home />
            </ErrorBoundary>
          } />
          <Route path="/login" element={
            <ErrorBoundary>
              <Login />
            </ErrorBoundary>
          } />
          <Route path="/register" element={
            <ErrorBoundary>
              <Register />
            </ErrorBoundary>
          } />
          <Route path="/dashboard" element={
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          } />
          <Route path="/finca" element={
            <ErrorBoundary>
              <Finca />
            </ErrorBoundary>
          } />
          <Route path="/insumos" element={
            <ErrorBoundary>
              <Insumos />
            </ErrorBoundary>
          } />
          <Route path="/mip" element={
            <ErrorBoundary>
              <MIP />
            </ErrorBoundary>
          } />
          <Route path="/alertas-ia" element={
            <ErrorBoundary>
              <AlertasIA />
            </ErrorBoundary>
          } />
          <Route path="/optimizacion-ia" element={
            <ErrorBoundary>
              <OptimizacionIA />
            </ErrorBoundary>
          } />
          <Route path="/analisis-mercado" element={
            <ErrorBoundary>
              <AnalisisMercado />
            </ErrorBoundary>
          } />
          <Route path="/trazabilidad" element={
            <ErrorBoundary>
              <Traceability />
            </ErrorBoundary>
          } />
          <Route path="/configuracion" element={
            <ErrorBoundary>
              <Configuracion />
            </ErrorBoundary>
          } />
          <Route path="/colaboradores" element={
            <ErrorBoundary>
              <Workers />
            </ErrorBoundary>
          } />
          <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/*" element={
            <ErrorBoundary>
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="dashboard" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="users" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                        <AdminUsers />
                      </ProtectedRoute>
                    } />
                    <Route path="coffee-growers" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.GROWERS_VIEW]}>
                        <AdminCoffeeGrowers />
                      </ProtectedRoute>
                    } />
                    <Route path="farms" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.FARMS_VIEW]}>
                        <AdminFarms />
                      </ProtectedRoute>
                    } />
                    <Route path="subscription-plans" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.PLANS_VIEW]} requiredRole="admin">
                        <AdminSubscriptionPlans />
                      </ProtectedRoute>
                    } />
                    <Route path="subscriptions" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.SUBSCRIPTIONS_VIEW]}>
                        <AdminSubscriptions />
                      </ProtectedRoute>
                    } />
                    <Route path="payments" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.PAYMENTS_VIEW]}>
                        <AdminPayments />
                      </ProtectedRoute>
                    } />
                    <Route path="reports" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.REPORTS_VIEW]}>
                        <AdminReports />
                      </ProtectedRoute>
                    } />
                    <Route path="analytics" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.REPORTS_VIEW]}>
                        <AdminAnalytics />
                      </ProtectedRoute>
                    } />
                    <Route path="profile" element={
                      <ProtectedRoute>
                        <AdminProfile />
                      </ProtectedRoute>
                    } />
                    <Route path="audit" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.AUDIT_VIEW]} requiredRole="admin">
                        <AdminAudit />
                      </ProtectedRoute>
                    } />
                    <Route path="security" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.SECURITY_VIEW]} requiredRole="admin">
                        <AdminSecurity />
                      </ProtectedRoute>
                    } />
                    <Route path="settings" element={
                      <ProtectedRoute requiredPermissions={[PERMISSIONS.SETTINGS_VIEW]} requiredRole="admin">
                        <AdminSettings />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } />
        </Routes>

        {/* Toaster para notificaciones del admin */}
        <Toaster position="top-right" richColors />


      </div>
    </Router>
  );
}
