import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bed, 
  UserCheck, 
  UserX, 
  DollarSign,
  ArrowRight,
  ShoppingCart,
  ConciergeBell
} from "lucide-react";
import { Link } from "wouter";
import type { Room } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });

  if (statsLoading || roomsLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Dashboard" subtitle="Visão geral das operações da pousada" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-green-200 bg-green-50';
      case 'occupied':
        return 'border-orange-200 bg-orange-50';
      case 'maintenance':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getRoomStatusDot = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-400';
      case 'occupied':
        return 'bg-orange-400';
      case 'maintenance':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getRoomStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'occupied':
        return 'Ocupado';
      case 'maintenance':
        return 'Manutenção';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar 
        title="Dashboard" 
        subtitle="Visão geral das operações da pousada"
        showNewButton
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quartos Ocupados</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.occupiedRooms || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    de {stats?.totalRooms || 0} quartos
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Bed className="text-warning text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chegadas Hoje</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.checkInsToday || 0}
                  </p>
                  <p className="text-sm text-success">Novos check-ins</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-success text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partidas Hoje</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.checkOutsToday || 0}
                  </p>
                  <p className="text-sm text-gray-500">Check-outs</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <UserX className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Hoje</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    R$ {typeof stats?.revenueToday === 'number' ? stats.revenueToday.toFixed(2) : '0,00'}
                  </p>
                  <p className="text-sm text-success">Faturamento</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-success text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Status */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Status dos Quartos</h2>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                      Disponível
                    </Badge>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-1.5"></span>
                      Ocupado
                    </Badge>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-1.5"></span>
                      Manutenção
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {rooms?.map((room) => (
                    <div
                      key={room.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getRoomStatusColor(room.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-gray-900">{room.number}</span>
                        <div className={`w-3 h-3 rounded-full ${getRoomStatusDot(room.status)}`}></div>
                      </div>
                      <p className="text-sm text-gray-600">{room.type}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {room.status === 'available' ? `R$ ${room.dailyRate}/dia` : getRoomStatusText(room.status)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Ações Rápidas</h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <Link href="/checkin">
                  <Button className="w-full flex items-center justify-between p-4 bg-primary text-white hover:bg-blue-700">
                    <div className="flex items-center">
                      <UserCheck className="mr-3" />
                      <span className="font-medium">Novo Check-in</span>
                    </div>
                    <ArrowRight />
                  </Button>
                </Link>

                <Link href="/sales">
                  <Button variant="outline" className="w-full flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <ShoppingCart className="mr-3" />
                      <span className="font-medium">Venda de Produtos</span>
                    </div>
                    <ArrowRight />
                  </Button>
                </Link>

                <Link href="/sales">
                  <Button variant="outline" className="w-full flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <ConciergeBell className="mr-3" />
                      <span className="font-medium">Venda de Serviços</span>
                    </div>
                    <ArrowRight />
                  </Button>
                </Link>

                <Link href="/checkout">
                  <Button variant="outline" className="w-full flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <UserX className="mr-3" />
                      <span className="font-medium">Check-out</span>
                    </div>
                    <ArrowRight />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
