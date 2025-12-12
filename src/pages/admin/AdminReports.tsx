import { useState, useEffect } from 'react';
import { adminHttpClient } from '../../utils/adminHttpClient';
import {
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  Users,
  DollarSign,
  Package,
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area
} from 'recharts';

interface ReportData {
  userGrowth: Array<{ month: string; users: number; growth: number }>;
  revenueAnalysis: Array<{ month: string; revenue: number; subscriptions: number }>;
  subscriptionDistribution: Array<{ plan: string; count: number; revenue: number }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
  coffeeGrowerStats: Array<{ region: string; growers: number; farms: number }>;
  topPerformingPlans: Array<{ plan: string; subscribers: number; revenue: number; churnRate: number }>;
  monthlyMetrics: {
    totalUsers: number;
    activeSubscriptions: number;
    totalRevenue: number;
    churnRate: number;
    averageRevenuePerUser: number;
    conversionRate: number;
  };
  trends: {
    userGrowthRate: number;
    revenueGrowthRate: number;
    subscriptionGrowthRate: number;
    churnTrend: number;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [selectedReport, setSelectedReport] = useState('overview');

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminHttpClient.get(`/api/admin/reports?period=${selectedPeriod}&type=${selectedReport}`);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, selectedReport]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando reportes...</p>
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
            <h3 className="font-semibold text-lg">Error al cargar reportes</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchReportData}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No hay datos de reportes disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Reportes y Analíticas
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado del rendimiento del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchReportData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="overview">Vista General</option>
            <option value="users">Análisis de Usuarios</option>
            <option value="revenue">Análisis de Ingresos</option>
            <option value="subscriptions">Análisis de Suscripciones</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="1month">Último mes</option>
            <option value="3months">Últimos 3 meses</option>
            <option value="6months">Últimos 6 meses</option>
            <option value="12months">Último año</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {reportData.monthlyMetrics.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Usuarios</div>
              <div className={`text-sm flex items-center gap-1 mt-1 ${reportData.trends.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                <TrendingUp className="h-3 w-3" />
                {reportData.trends.userGrowthRate >= 0 ? '+' : ''}{reportData.trends.userGrowthRate.toFixed(1)}%
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ${reportData.monthlyMetrics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Ingresos Totales</div>
              <div className={`text-sm flex items-center gap-1 mt-1 ${reportData.trends.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                <TrendingUp className="h-3 w-3" />
                {reportData.trends.revenueGrowthRate >= 0 ? '+' : ''}{reportData.trends.revenueGrowthRate.toFixed(1)}%
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {reportData.monthlyMetrics.activeSubscriptions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Suscripciones Activas</div>
              <div className={`text-sm flex items-center gap-1 mt-1 ${reportData.trends.subscriptionGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                <TrendingUp className="h-3 w-3" />
                {reportData.trends.subscriptionGrowthRate >= 0 ? '+' : ''}{reportData.trends.subscriptionGrowthRate.toFixed(1)}%
              </div>
            </div>
            <Package className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ${reportData.monthlyMetrics.averageRevenuePerUser.toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">ARPU</div>
              <div className="text-sm text-gray-500 mt-1">
                Conversión: {reportData.monthlyMetrics.conversionRate.toFixed(1)}%
              </div>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        {reportData.userGrowth && reportData.userGrowth.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento de Usuarios</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue Analysis Chart */}
        {reportData.revenueAnalysis && reportData.revenueAnalysis.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Ingresos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.revenueAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Subscription Distribution */}
        {reportData.subscriptionDistribution && reportData.subscriptionDistribution.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Rol</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={reportData.subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ plan, count }) => `${plan}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reportData.subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Coffee Grower Stats */}
        {reportData.coffeeGrowerStats && reportData.coffeeGrowerStats.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Caficultores por Región</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.coffeeGrowerStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="growers" fill="#10b981" name="Caficultores" />
                <Bar dataKey="farms" fill="#3b82f6" name="Fincas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}