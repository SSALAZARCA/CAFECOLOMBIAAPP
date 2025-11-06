import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import { adminHttpClient } from '../../utils/adminHttpClient';
import AdminApiTest from '../../components/admin/AdminApiTest';
import QuickActionsPanel from '../../components/admin/QuickActionsPanel';
import RealTimeNotifications from '../../components/admin/RealTimeNotifications';
import InteractiveWidgets from '../../components/admin/InteractiveWidgets';
import AdvancedFilters, { FilterOption, FilterValue } from '../../components/admin/AdvancedFilters';
import { useWidgetData } from '../../components/admin/InteractiveWidgets';
import {
  Users,
  UserCheck,
  MapPin,
  CreditCard,
  DollarSign,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

interface DashboardMetrics {
  totalUsers: number;
  totalCoffeeGrowers: number;
  totalFarms: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
  activePayments: number;
  systemActivity: number;
  growthRates: {
    users: number;
    revenue: number;
    subscriptions: number;
  };
}

interface ChartData {
  userRegistrations: Array<{ month: string; users: number; growers: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; subscriptions: number }>;
  subscriptionsByPlan: Array<{ name: string; value: number; color: string }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showApiTest, setShowApiTest] = useState(false);
  
  // Estados para filtros avanzados
  const [filterValues, setFilterValues] = useState<FilterValue>({});
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  
  const { dashboardMetrics, fetchDashboardMetrics } = useAdminStore();
  const { widgets } = useWidgetData();

  // Configuración de filtros para el dashboard
  const dashboardFilters: FilterOption[] = [
    {
      key: 'period',
      label: 'Período',
      type: 'select',
      options: [
        { value: '7d', label: 'Últimos 7 días' },
        { value: '30d', label: 'Últimos 30 días' },
        { value: '90d', label: 'Últimos 90 días' },
        { value: '1y', label: 'Último año' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Rango de Fechas',
      type: 'dateRange'
    },
    {
      key: 'userType',
      label: 'Tipo de Usuario',
      type: 'multiSelect',
      options: [
        { value: 'admin', label: 'Administradores' },
        { value: 'grower', label: 'Caficultores' },
        { value: 'buyer', label: 'Compradores' }
      ]
    },
    {
      key: 'region',
      label: 'Región',
      type: 'select',
      options: [
        { value: 'huila', label: 'Huila' },
        { value: 'nariño', label: 'Nariño' },
        { value: 'cauca', label: 'Cauca' },
        { value: 'tolima', label: 'Tolima' }
      ]
    }
  ];

  // Manejo de filtros
  const handleFilterChange = (values: FilterValue) => {
    setFilterValues(values);
    // Aplicar filtros a los datos
    if (values.period && values.period !== selectedPeriod) {
      setSelectedPeriod(values.period);
    }
  };

  const handleFilterReset = () => {
    setFilterValues({});
    setSelectedPeriod('30d');
  };
  
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting dashboard data load...');
      
      // Cargar métricas principales
      console.log('📊 Loading dashboard stats...');
      const metricsData = await adminHttpClient.get('/admin/dashboard/stats');
      console.log('✅ Dashboard stats loaded:', metricsData);
      
      setMetrics({
        totalUsers: metricsData.users,
        totalCoffeeGrowers: metricsData.users * 0.7, // Estimación
        totalFarms: metricsData.users * 0.5, // Estimación
        totalSubscriptions: metricsData.admins * 10, // Estimación
        monthlyRevenue: 15000,
        activePayments: 25,
        systemActivity: 85,
        growthRates: {
          users: 12.5,
          revenue: 8.3,
          subscriptions: 15.2
        }
      });
      
      // Cargar datos de gráficos
      console.log('📈 Loading chart data...');
      const chartData = await adminHttpClient.get(`/admin/dashboard/charts?period=${selectedPeriod}`);
      console.log('✅ Chart data loaded:', chartData);
      
      setChartData({
        userRegistrations: [
          { month: 'Oct', users: 10, growers: 8 },
          { month: 'Nov', users: 25, growers: 20 }
        ],
        monthlyRevenue: chartData.revenueData,
        subscriptionsByPlan: chartData.subscriptionDistribution.map((item: any, index: number) => ({
          name: item.name,
          value: item.value,
          color: ['#3B82F6', '#10B981', '#F59E0B'][index] || '#6B7280'
        })),
        paymentMethods: [
          { method: 'Tarjeta', count: 45, percentage: 60 },
          { method: 'Transferencia', count: 25, percentage: 33 },
          { method: 'Efectivo', count: 5, percentage: 7 }
        ]
      });
      
      console.log('🎉 Dashboard data loaded successfully!');
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Error al cargar el dashboard</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Users className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* contenido del dashboard, gráficas, etc. */}
    </div>
  );
};

export default AdminDashboard;