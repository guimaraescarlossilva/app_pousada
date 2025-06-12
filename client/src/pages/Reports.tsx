import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartLine, CalendarCheck, DollarSign, TrendingUp, Users, Bed } from "lucide-react";

export default function Reports() {
  const { type } = useParams();
  const activeTab = type || "financial";

  const { data: reservations } = useQuery({
    queryKey: ['/api/reservations'],
  });

  const { data: rooms } = useQuery({
    queryKey: ['/api/rooms'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: productSales } = useQuery({
    queryKey: ['/api/product-sales'],
  });

  const { data: serviceSales } = useQuery({
    queryKey: ['/api/service-sales'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Calculate financial metrics
  const calculateFinancialMetrics = () => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    const completedReservations = reservations?.filter((r: any) => r.status === 'completed') || [];
    
    const thisMonthReservations = completedReservations.filter((r: any) => 
      new Date(r.actualCheckOutDate) >= thisMonth
    );
    
    const lastMonthReservations = completedReservations.filter((r: any) => {
      const checkOut = new Date(r.actualCheckOutDate);
      return checkOut >= lastMonth && checkOut < thisMonth;
    });

    const thisMonthRevenue = thisMonthReservations.reduce((sum: number, r: any) => 
      sum + parseFloat(r.totalAmount || 0), 0
    );
    
    const lastMonthRevenue = lastMonthReservations.reduce((sum: number, r: any) => 
      sum + parseFloat(r.totalAmount || 0), 0
    );

    const productRevenue = productSales?.reduce((sum: number, sale: any) => 
      sum + parseFloat(sale.totalPrice), 0
    ) || 0;

    const serviceRevenue = serviceSales?.reduce((sum: number, sale: any) => 
      sum + parseFloat(sale.price), 0
    ) || 0;

    return {
      thisMonthRevenue,
      lastMonthRevenue,
      revenueGrowth: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
      totalRevenue: thisMonthRevenue + productRevenue + serviceRevenue,
      productRevenue,
      serviceRevenue,
      thisMonthReservations: thisMonthReservations.length,
      lastMonthReservations: lastMonthReservations.length,
    };
  };

  // Calculate occupancy metrics
  const calculateOccupancyMetrics = () => {
    const totalRooms = rooms?.length || 0;
    const occupiedRooms = rooms?.filter((r: any) => r.status === 'occupied').length || 0;
    const availableRooms = rooms?.filter((r: any) => r.status === 'available').length || 0;
    const maintenanceRooms = rooms?.filter((r: any) => r.status === 'maintenance').length || 0;
    
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const thisMonthCheckIns = reservations?.filter((r: any) => 
      new Date(r.checkInDate) >= thisMonth
    ).length || 0;

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyRate,
      thisMonthCheckIns,
    };
  };

  const financialMetrics = calculateFinancialMetrics();
  const occupancyMetrics = calculateOccupancyMetrics();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Relatórios" subtitle="Análises e estatísticas da pousada" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="financial" className="flex items-center">
              <ChartLine className="w-4 h-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="occupancy" className="flex items-center">
              <CalendarCheck className="w-4 h-4 mr-2" />
              Ocupação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita do Mês</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        R$ {financialMetrics.thisMonthRevenue.toFixed(2)}
                      </p>
                      <p className={`text-sm mt-1 ${financialMetrics.revenueGrowth >= 0 ? 'text-success' : 'text-error'}`}>
                        {financialMetrics.revenueGrowth >= 0 ? '+' : ''}
                        {financialMetrics.revenueGrowth.toFixed(1)}% vs mês anterior
                      </p>
                    </div>
                    <DollarSign className="w-12 h-12 text-success bg-green-50 p-2 rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Produtos</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        R$ {financialMetrics.productRevenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Vendas de produtos</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-primary bg-blue-50 p-2 rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Serviços</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        R$ {financialMetrics.serviceRevenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Vendas de serviços</p>
                    </div>
                    <Users className="w-12 h-12 text-warning bg-orange-50 p-2 rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reservas do Mês</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {financialMetrics.thisMonthReservations}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Check-outs realizados</p>
                    </div>
                    <CalendarCheck className="w-12 h-12 text-success bg-green-50 p-2 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Completed Reservations */}
            <Card>
              <CardHeader>
                <CardTitle>Reservas Finalizadas Recentemente</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Check-out</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Quarto</TableHead>
                      <TableHead>Noites</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations?.filter((r: any) => r.status === 'completed')
                      .slice(0, 10)
                      .map((reservation: any) => {
                        const client = clients?.find((c: any) => c.id === reservation.clientId);
                        const room = rooms?.find((r: any) => r.id === reservation.roomId);
                        const checkIn = new Date(reservation.checkInDate);
                        const checkOut = new Date(reservation.actualCheckOutDate);
                        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <TableRow key={reservation.id}>
                            <TableCell>{checkOut.toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{client?.fullName || 'N/A'}</TableCell>
                            <TableCell>{room?.number || 'N/A'}</TableCell>
                            <TableCell>{nights}</TableCell>
                            <TableCell>R$ {parseFloat(reservation.totalAmount || 0).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {reservation.paymentMethod || 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="occupancy" className="space-y-6">
            {/* Occupancy Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {occupancyMetrics.occupancyRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {occupancyMetrics.occupiedRooms} de {occupancyMetrics.totalRooms} quartos
                      </p>
                    </div>
                    <Bed className="w-12 h-12 text-primary bg-blue-50 p-2 rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Quartos Disponíveis</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {occupancyMetrics.availableRooms}
                      </p>
                      <p className="text-sm text-success mt-1">Prontos para ocupação</p>
                    </div>
                    <Bed className="w-12 h-12 text-success bg-green-50 p-2 rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Em Manutenção</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {occupancyMetrics.maintenanceRooms}
                      </p>
                      <p className="text-sm text-error mt-1">Fora de operação</p>
                    </div>
                    <Bed className="w-12 h-12 text-error bg-red-50 p-2 rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Check-ins do Mês</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {occupancyMetrics.thisMonthCheckIns}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Novos hóspedes</p>
                    </div>
                    <Users className="w-12 h-12 text-warning bg-orange-50 p-2 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Room Status Details */}
            <Card>
              <CardHeader>
                <CardTitle>Status Detalhado dos Quartos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Diária</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms?.map((room: any) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.number}</TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell>{room.capacity} pessoa{room.capacity > 1 ? 's' : ''}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              room.status === 'available' ? 'default' :
                              room.status === 'occupied' ? 'secondary' : 'destructive'
                            }
                          >
                            {room.status === 'available' ? 'Disponível' :
                             room.status === 'occupied' ? 'Ocupado' : 'Manutenção'}
                          </Badge>
                        </TableCell>
                        <TableCell>R$ {parseFloat(room.dailyRate).toFixed(2)}</TableCell>
                        <TableCell>{room.observations || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
