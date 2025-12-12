import React from 'react';
import { Link } from 'react-router-dom';
import {
    Coffee,
    TrendingUp,
    ShieldCheck,
    Smartphone,
    BarChart3,
    Leaf,
    ArrowRight,
    Check
} from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Coffee className="h-8 w-8 text-green-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Café Colombia</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Características</a>
                            <a href="#benefits" className="text-gray-600 hover:text-green-600 transition-colors">Beneficios</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors">Testimonios</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium">
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/register"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Registrarse
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white pt-16 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                                <span className="block">Gestión inteligente para</span>
                                <span className="block text-green-600">tu finca cafetera</span>
                            </h1>
                            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                Optimiza tu producción, controla tus costos y toma mejores decisiones con nuestra plataforma integral diseñada específicamente para caficultores colombianos.
                            </p>
                            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all"
                                >
                                    Comenzar Gratis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <p className="mt-3 text-sm text-gray-500">
                                    No requiere tarjeta de crédito • Plan gratuito disponible
                                </p>
                            </div>
                        </div>
                        <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md overflow-hidden">
                                <img
                                    className="w-full"
                                    src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Caficultor en campo"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Características</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Todo lo que necesitas en un solo lugar
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Herramientas potentes y fáciles de usar para llevar tu finca al siguiente nivel.
                        </p>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: BarChart3,
                                    title: 'Control de Producción',
                                    description: 'Registra tus cosechas, monitorea rendimientos por lote y visualiza tendencias históricas.'
                                },
                                {
                                    icon: Leaf,
                                    title: 'Manejo Agronómico',
                                    description: 'Planifica fertilizaciones, controla plagas y enfermedades, y gestiona labores culturales.'
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Análisis de Costos',
                                    description: 'Lleva un control detallado de gastos e ingresos para conocer la rentabilidad real de tu negocio.'
                                },
                                {
                                    icon: Smartphone,
                                    title: 'Acceso Móvil',
                                    description: 'Accede a tu información desde cualquier lugar, incluso sin conexión a internet en el campo.'
                                },
                                {
                                    icon: ShieldCheck,
                                    title: 'Trazabilidad',
                                    description: 'Genera códigos QR para tus lotes y comparte la historia de tu café con tus clientes.'
                                },
                                {
                                    icon: Coffee,
                                    title: 'Calidad de Taza',
                                    description: 'Registra perfiles de catación y asócialos a procesos de beneficio específicos.'
                                }
                            ].map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="pt-6">
                                        <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                                            <div className="-mt-6">
                                                <div>
                                                    <span className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                                                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                                                    </span>
                                                </div>
                                                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                                                <p className="mt-5 text-base text-gray-500">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits/CTA Section */}
            <div id="benefits" className="bg-green-700">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">¿Listo para modernizar tu finca?</span>
                        <span className="block">Únete a cientos de caficultores exitosos.</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-green-100">
                        Empieza hoy mismo a tomar el control de tu negocio cafetero con nuestra plataforma intuitiva y segura.
                    </p>
                    <Link
                        to="/register"
                        className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 sm:w-auto transition-colors"
                    >
                        Registrarme Gratis
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                        <div>
                            <div className="flex items-center mb-4">
                                <Coffee className="h-8 w-8 text-green-500" />
                                <span className="ml-2 text-xl font-bold">Café Colombia</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Tecnología al servicio del campo colombiano. Transformando la caficultura con datos y herramientas digitales.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Plataforma</h3>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Características</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Precios</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Soporte</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Legal</h3>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacidad</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Términos</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
                        <p className="text-base text-gray-400">
                            &copy; {new Date().getFullYear()} Café Colombia App. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
