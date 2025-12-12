import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminHttpClient } from '../../utils/adminHttpClient';
import {
  Users,
  UserCheck,
  MapPin,
  Settings,
  TrendingUp,
  Activity,
  AlertCircle,
  Coffee,
  DollarSign,
  Package,
  Award,
  Layers
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  users: number;
  admins: number;
  workers: number;
  newUsersThisMonth: number;
  farms: number;
  lots: number;
  totalCultivatedArea: number;
  totalProduction: number;
  monthlyProduction: number;
  monthlyExpenses: number;
  averageQuality: number;
  microlots: number;
  configurations: number;
}

interface ChartData {
  userGrowth: Array<{ date: string; users: number }>;
  subscriptionDistribution: Array<{ name: string; value: number }>;
  productionTrend?: Array<{ month: string; production: number }>;
  farmsByLocation?: Array<{ name: string; count: number }>;
  expensesByCategory?: Array<{ name: string; value: number }>;
  qualityDistribution?: Array<{ grade: string; count: number }>;
  revenueData: Array<{ month: string; revenue: number }>;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsData = await adminHttpClient.get('/api/admin/dashboard/stats');
      setStats(statsData);

      const charts = await adminHttpClient.get('/api/admin/dashboard/charts?period=30d');
      setChartData(charts);

    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md">
          <div className="flex items-center space-x-3 text-red-800 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h3 className="font-semibold text-lg">Error al cargar el dashboard</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    color: string;
    onClick?: () => void;
    suffix?: string;
  }> = ({ title, value, icon: Icon, color, onClick, suffix = '' }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-600 mt-2">
                Sistema Café Colombia - Métricas en Tiempo Real
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Activity className="h-5 w-5" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Métricas Principales */}
        {stats && (
          <>
            {/* Fila 1: Usuarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Usuarios del Sistema"
                value={stats.users}
                icon={Users}
                color="bg-blue-500"
                onClick={() => navigate('/admin/users')}
              />
              <MetricCard
                title="Administradores"
                value={stats.admins}
                icon={UserCheck}
                color="bg-green-500"
              />
              <MetricCard
                title="Caficultores/Trabajadores"
                value={stats.workers}
                icon={Coffee}
                color="bg-amber-600"
              />
              <MetricCard
                title="Nuevos Usuarios (30d)"
                value={stats.newUsersThisMonth}
                icon={TrendingUp}
                color="bg-purple-500"
              />
            </div>

            {/* Fila 2: Fincas y Producción */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Fincas Registradas"
                value={stats.farms}
                icon={MapPin}
                color="bg-emerald-500"
                onClick={() => navigate('/admin/coffee-growers')}
              />
              <MetricCard
                title="Lotes Activos"
                value={stats.lots}
                icon={Layers}
                color="bg-teal-500"
              />
              <MetricCard
                title="Área Cultivada"
                value={stats.totalCultivatedArea.toFixed(1)}
                icon={MapPin}
                color="bg-lime-600"
                suffix=" ha"
              />
              <MetricCard
                title="Producción Total"
                value={stats.totalProduction.toFixed(0)}
                icon={Package}
                color="bg-orange-500"
                suffix=" kg"
              />
            </div>

            {/* Fila 3: Calidad y Finanzas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Producción del Mes"
                value={stats.monthlyProduction.toFixed(0)}
                icon={TrendingUp}
                color="bg-indigo-500"
                suffix=" kg"
              />
              <MetricCard
                title="Gastos del Mes"
                value={`$${stats.monthlyExpenses.toLocaleString()}`}
                icon={DollarSign}
                color="bg-red-500"
              />
              <MetricCard
                title="Calidad Promedio SCA"
                value={stats.averageQuality > 0 ? stats.averageQuality.toFixed(1) : 'N/A'}
                icon={Award}
                color="bg-yellow-500"
              />
              <MetricCard
                title="Microlotes Activos"
                value={stats.microlots}
                icon={Package}
                color="bg-pink-500"
              />
            </div>
          </>
        )}

        {/* Gráficos */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crecimiento de Usuarios */}
            {chartData.userGrowth && chartData.userGrowth.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Crecimiento de Usuarios
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name="Usuarios"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Producción Mensual */}
            {chartData.productionTrend && chartData.productionTrend.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tendencia de Producción (kg)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.productionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="production" fill="#10B981" name="Producción (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Distribución por Rol */}
            {chartData.subscriptionDistribution && chartData.subscriptionDistribution.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Distribución de Usuarios por Rol
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.subscriptionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.subscriptionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Fincas por Ubicación */}
            {chartData.farmsByLocation && chartData.farmsByLocation.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fincas por Ubicación
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.farmsByLocation} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#F59E0B" name="Fincas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gastos por Categoría */}
            {chartData.expensesByCategory && chartData.expensesByCategory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gastos del Mes por Categoría
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Distribución de Calidad */}
            {chartData.qualityDistribution && chartData.qualityDistribution.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Distribución de Calidad SCA
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.qualityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8B5CF6" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Información del Sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Activity className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Dashboard con 13 Métricas en Tiempo Real
              </h4>
              <p className="text-blue-800 text-sm">
                Todos los datos provienen de la base de datos. Incluye métricas de usuarios, fincas,
                producción, calidad y finanzas. Última actualización: {new Date().toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;