import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UserX, Receipt, CreditCard, DollarSign, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Reservation, Client, Room } from "@shared/schema";

export default function CheckOut() {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discount, setDiscount] = useState(0);

  const { toast } = useToast();

  const { data: activeReservations, isLoading: reservationsLoading } = useQuery<Reservation[]>({
    queryKey: ['/api/reservations/active'],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });

  const { data: productSales } = useQuery({
    queryKey: ['/api/product-sales'],
    enabled: !!selectedReservation,
  });

  const { data: serviceSales } = useQuery({
    queryKey: ['/api/service-sales'],
    enabled: !!selectedReservation,
  });

  const checkOutMutation = useMutation({
    mutationFn: async ({ reservationId, data }: { reservationId: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/reservations/${reservationId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setIsDialogOpen(false);
      setSelectedReservation(null);
      toast({
        title: "Sucesso",
        description: "Check-out realizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao realizar check-out. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCheckOut = async () => {
    if (!selectedReservation || !paymentMethod) {
      toast({
        title: "Erro",
        description: "Selecione a forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    const room = rooms?.find(r => r.id === selectedReservation.roomId);
    const checkInDate = new Date(selectedReservation.checkInDate);
    const checkOutDate = new Date();
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyRate = room ? parseFloat(room.dailyRate) : 0;
    const accommodationTotal = nights * dailyRate;
    
    const reservationProductSales = productSales?.filter((sale: any) => sale.reservationId === selectedReservation.id) || [];
    const reservationServiceSales = serviceSales?.filter((sale: any) => sale.reservationId === selectedReservation.id) || [];
    
    const productsTotal = reservationProductSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalPrice), 0);
    const servicesTotal = reservationServiceSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.price), 0);
    
    const subtotal = accommodationTotal + productsTotal + servicesTotal;
    const discountAmount = (subtotal * discount) / 100;
    const totalAmount = subtotal - discountAmount;

    const updateData = {
      actualCheckOutDate: checkOutDate,
      status: "completed",
      paymentMethod,
      totalAmount: totalAmount.toString(),
    };

    // Update room status to available
    await apiRequest("PUT", `/api/rooms/${selectedReservation.roomId}`, { status: "available" });
    
    checkOutMutation.mutate({ reservationId: selectedReservation.id, data: updateData });
  };

  const openCheckOutDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDialogOpen(true);
    setPaymentMethod("");
    setDiscount(0);
  };

  const calculateStayDetails = (reservation: Reservation) => {
    const room = rooms?.find(r => r.id === reservation.roomId);
    const checkInDate = new Date(reservation.checkInDate);
    const checkOutDate = new Date();
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyRate = room ? parseFloat(room.dailyRate) : 0;
    const accommodationTotal = nights * dailyRate;
    
    const reservationProductSales = productSales?.filter((sale: any) => sale.reservationId === reservation.id) || [];
    const reservationServiceSales = serviceSales?.filter((sale: any) => sale.reservationId === reservation.id) || [];
    
    const productsTotal = reservationProductSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalPrice), 0);
    const servicesTotal = reservationServiceSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.price), 0);
    
    const subtotal = accommodationTotal + productsTotal + servicesTotal;
    const discountAmount = (subtotal * discount) / 100;
    const totalAmount = subtotal - discountAmount;

    return {
      nights,
      dailyRate,
      accommodationTotal,
      productsTotal,
      servicesTotal,
      subtotal,
      discountAmount,
      totalAmount,
      reservationProductSales,
      reservationServiceSales,
    };
  };

  if (reservationsLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Check-out" subtitle="Finalizar hospedagens" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando reservas...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const stayDetails = selectedReservation ? calculateStayDetails(selectedReservation) : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Check-out" subtitle="Finalizar hospedagens" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserX className="w-5 h-5 mr-2" />
              Hospedagens Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activeReservations?.length ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma hospedagem ativa no momento.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Quarto</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Previsão Saída</TableHead>
                    <TableHead>Hóspedes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeReservations.map((reservation) => {
                    const client = clients?.find(c => c.id === reservation.clientId);
                    const room = rooms?.find(r => r.id === reservation.roomId);
                    
                    return (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">{client?.fullName || 'N/A'}</TableCell>
                        <TableCell>Quarto {room?.number || 'N/A'} - {room?.type || 'N/A'}</TableCell>
                        <TableCell>{new Date(reservation.checkInDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{new Date(reservation.expectedCheckOutDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{reservation.numberOfGuests}</TableCell>
                        <TableCell>
                          <Badge variant="default">Ativo</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCheckOutDialog(reservation)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Check-out
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Check-out Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Finalizar Check-out
              </DialogTitle>
            </DialogHeader>
            
            {selectedReservation && stayDetails && (
              <div className="space-y-6">
                {/* Guest Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <p className="text-lg font-medium">
                      {clients?.find(c => c.id === selectedReservation.clientId)?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label>Quarto</Label>
                    <p className="text-lg font-medium">
                      {rooms?.find(r => r.id === selectedReservation.roomId)?.number || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Stay Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detalhes da Hospedagem</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Check-in:</span>
                      <span className="ml-2">{new Date(selectedReservation.checkInDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Check-out:</span>
                      <span className="ml-2">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Noites:</span>
                      <span className="ml-2">{stayDetails.nights}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Diária:</span>
                      <span className="ml-2">R$ {stayDetails.dailyRate.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Hospedagem ({stayDetails.nights} noites)</span>
                      <span>R$ {stayDetails.accommodationTotal.toFixed(2)}</span>
                    </div>
                    {stayDetails.productsTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Produtos consumidos</span>
                        <span>R$ {stayDetails.productsTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {stayDetails.servicesTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Serviços utilizados</span>
                        <span>R$ {stayDetails.servicesTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>R$ {stayDetails.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* Discount */}
                    <div className="flex justify-between items-center">
                      <Label htmlFor="discount">Desconto (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Desconto ({discount}%)</span>
                        <span>-R$ {stayDetails.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>R$ {stayDetails.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending || !paymentMethod}
                    className="bg-primary text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {checkOutMutation.isPending ? "Processando..." : "Finalizar Check-out"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
