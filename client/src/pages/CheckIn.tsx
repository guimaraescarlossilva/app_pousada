import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, UserCheck, Calendar, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client, Room, InsertReservation } from "@shared/schema";

export default function CheckIn() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InsertReservation>({
    clientId: 0,
    roomId: 0,
    checkInDate: new Date(),
    expectedCheckOutDate: new Date(),
    numberOfGuests: 1,
    paymentMethod: "",
    notes: "",
  });

  const { toast } = useToast();

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: availableRooms, isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ['/api/rooms/available'],
  });

  const { data: activeReservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ['/api/reservations/active'],
  });

  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: InsertReservation) => {
      const response = await apiRequest("POST", "/api/reservations", reservationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Check-in realizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao realizar check-in. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData({
      clientId: 0,
      roomId: 0,
      checkInDate: new Date(),
      expectedCheckOutDate: tomorrow,
      numberOfGuests: 1,
      paymentMethod: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientId === 0 || formData.roomId === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e um quarto.",
        variant: "destructive",
      });
      return;
    }
    createReservationMutation.mutate(formData);
  };

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (field: 'checkInDate' | 'expectedCheckOutDate', value: string) => {
    setFormData({ ...formData, [field]: new Date(value) });
  };

  const getActiveReservationsForToday = () => {
    const today = new Date().toDateString();
    return activeReservations?.filter((reservation: any) => 
      new Date(reservation.checkInDate).toDateString() === today
    ) || [];
  };

  if (clientsLoading || roomsLoading || reservationsLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Check-in" subtitle="Realizar check-in de hóspedes" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dados...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const todaysCheckIns = getActiveReservationsForToday();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Check-in" subtitle="Realizar check-in de hóspedes" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-in Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Novo Check-in
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Cliente</Label>
                  <Select
                    value={formData.clientId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, clientId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.fullName} {client.cpf ? `- ${client.cpf}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="roomId">Quarto</Label>
                  <Select
                    value={formData.roomId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, roomId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um quarto" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms?.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          Quarto {room.number} - {room.type} (R$ {parseFloat(room.dailyRate).toFixed(2)}/dia)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkInDate">Data/Hora Entrada</Label>
                    <Input
                      id="checkInDate"
                      type="datetime-local"
                      value={formatDateTime(formData.checkInDate)}
                      onChange={(e) => handleDateTimeChange('checkInDate', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedCheckOutDate">Previsão Saída</Label>
                    <Input
                      id="expectedCheckOutDate"
                      type="datetime-local"
                      value={formatDateTime(formData.expectedCheckOutDate)}
                      onChange={(e) => handleDateTimeChange('expectedCheckOutDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numberOfGuests">Número de Hóspedes</Label>
                    <Input
                      id="numberOfGuests"
                      type="number"
                      min="1"
                      value={formData.numberOfGuests}
                      onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                    <Select
                      value={formData.paymentMethod || ""}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observações adicionais sobre a hospedagem"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createReservationMutation.isPending}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {createReservationMutation.isPending ? "Processando..." : "Realizar Check-in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Today's Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Check-ins de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysCheckIns.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum check-in realizado hoje.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysCheckIns.map((reservation: any) => {
                    const client = clients?.find(c => c.id === reservation.clientId);
                    const room = availableRooms?.find(r => r.id === reservation.roomId);
                    
                    return (
                      <div key={reservation.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{client?.fullName || 'Cliente não encontrado'}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(reservation.checkInDate).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Quarto: {room?.number || 'N/A'} - {room?.type || 'N/A'}</p>
                          <p>Hóspedes: {reservation.numberOfGuests}</p>
                          <p>Saída prevista: {new Date(reservation.expectedCheckOutDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
