import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service, InsertService } from "@shared/schema";

export default function Services() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<InsertService>({
    name: "",
    description: "",
    price: "0",
    estimatedTime: "",
  });

  const { toast } = useToast();

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: InsertService) => {
      const response = await apiRequest("POST", "/api/services", serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, serviceData }: { id: number; serviceData: Partial<InsertService> }) => {
      const response = await apiRequest("PUT", `/api/services/${id}`, serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "0",
      estimatedTime: "",
    });
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, serviceData: formData });
    } else {
      createServiceMutation.mutate(formData);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      estimatedTime: service.estimatedTime || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Serviços" subtitle="Gerenciar serviços da pousada" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando serviços...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Serviços" subtitle="Gerenciar serviços da pousada" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Serviços</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Serviço
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? "Editar Serviço" : "Novo Serviço"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Serviço</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="ex: Lavanderia, Massagem, Passeio"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descrição detalhada do serviço"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Valor (R$)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimatedTime">Tempo Estimado</Label>
                        <Input
                          id="estimatedTime"
                          value={formData.estimatedTime}
                          onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                          placeholder="ex: 1h, 30min"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                      >
                        {editingService ? "Atualizar" : "Criar"}
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tempo Estimado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.description || "-"}</TableCell>
                    <TableCell>R$ {parseFloat(service.price).toFixed(2)}</TableCell>
                    <TableCell>{service.estimatedTime || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          disabled={deleteServiceMutation.isPending}
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
