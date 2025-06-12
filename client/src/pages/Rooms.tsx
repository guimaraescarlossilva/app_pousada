import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Room, InsertRoom } from "@shared/schema";

export default function Rooms() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<InsertRoom>({
    number: "",
    type: "",
    capacity: 1,
    dailyRate: "0",
    status: "available",
    observations: "",
  });

  const { toast } = useToast();

  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });

  const createRoomMutation = useMutation({
    mutationFn: async (roomData: InsertRoom) => {
      const response = await apiRequest("POST", "/api/rooms", roomData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Quarto criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar quarto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, roomData }: { id: number; roomData: Partial<InsertRoom> }) => {
      const response = await apiRequest("PUT", `/api/rooms/${id}`, roomData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Quarto atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar quarto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({
        title: "Sucesso",
        description: "Quarto excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir quarto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      number: "",
      type: "",
      capacity: 1,
      dailyRate: "0",
      status: "available",
      observations: "",
    });
    setEditingRoom(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoomMutation.mutate({ id: editingRoom.id, roomData: formData });
    } else {
      createRoomMutation.mutate(formData);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      type: room.type,
      capacity: room.capacity,
      dailyRate: room.dailyRate,
      status: room.status,
      observations: room.observations || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este quarto?")) {
      deleteRoomMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      available: { label: "Disponível", variant: "default" },
      occupied: { label: "Ocupado", variant: "secondary" },
      maintenance: { label: "Manutenção", variant: "destructive" },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      solteiro: "Solteiro",
      casal: "Casal",
      familia: "Família",
      suite: "Suíte",
    };
    return typeMap[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Quartos" subtitle="Gerenciar quartos da pousada" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando quartos...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Quartos" subtitle="Gerenciar quartos da pousada" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Quartos</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Quarto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRoom ? "Editar Quarto" : "Novo Quarto"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="number">Número do Quarto</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solteiro">Solteiro</SelectItem>
                          <SelectItem value="casal">Casal</SelectItem>
                          <SelectItem value="familia">Família</SelectItem>
                          <SelectItem value="suite">Suíte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capacity">Capacidade</Label>
                        <Input
                          id="capacity"
                          type="number"
                          min="1"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dailyRate">Diária (R$)</Label>
                        <Input
                          id="dailyRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.dailyRate}
                          onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="occupied">Ocupado</SelectItem>
                          <SelectItem value="maintenance">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="observations">Observações</Label>
                      <Textarea
                        id="observations"
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createRoomMutation.isPending || updateRoomMutation.isPending}
                      >
                        {editingRoom ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Diária</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms?.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.number}</TableCell>
                    <TableCell>{getTypeLabel(room.type)}</TableCell>
                    <TableCell>{room.capacity} pessoa{room.capacity > 1 ? 's' : ''}</TableCell>
                    <TableCell>R$ {parseFloat(room.dailyRate).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell>{room.observations || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(room)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(room.id)}
                          disabled={deleteRoomMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
