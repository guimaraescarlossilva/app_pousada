import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Users,
  BookUser,
  DoorOpen,
  ShoppingCart,
  ConciergeBell,
  UserCheck,
  ScanBarcode,
  Warehouse,
  UserX,
  ChartLine,
  CalendarCheck,
  BarChart3,
  Bed,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    items: [
      { name: "Visão Geral", href: "/", icon: BarChart3 },
    ],
  },
  {
    name: "Cadastros",
    items: [
      { name: "Funcionários", href: "/users", icon: Users },
      { name: "Clientes", href: "/clients", icon: BookUser },
      { name: "Quartos", href: "/rooms", icon: DoorOpen },
      { name: "Produtos", href: "/products", icon: ShoppingCart },
      { name: "Serviços", href: "/services", icon: ConciergeBell },
    ],
  },
  {
    name: "Operações",
    items: [
      { name: "Check-in", href: "/checkin", icon: UserCheck },
      { name: "Vendas", href: "/sales", icon: ScanBarcode },
      { name: "Estoque", href: "/inventory", icon: Warehouse },
      { name: "Check-out", href: "/checkout", icon: UserX },
    ],
  },
  {
    name: "Relatórios",
    items: [
      { name: "Financeiro", href: "/reports/financial", icon: ChartLine },
      { name: "Ocupação", href: "/reports/occupancy", icon: CalendarCheck },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex-shrink-0">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bed className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Pousada Manager</h1>
            <p className="text-sm text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Users className="text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Sistema Admin</p>
            <p className="text-xs text-gray-500">Gerente</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {navigation.map((section) => (
          <div key={section.name} className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.name}
            </h3>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer",
                      isActive
                        ? "text-primary bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
