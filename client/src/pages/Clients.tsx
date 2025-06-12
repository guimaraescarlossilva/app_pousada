import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client, InsertClient } from "@shared/schema";

export default function Clients() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<InsertClient>({
    fullName: "",
    cpf: "",
    rg: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
  });

  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: InsertClient) => {
      const response = await apiRequest("POST", "/api/clients", clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, clientData }: { id: number; clientData: Partial<InsertClient> }) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      cpf: "",
      rg: "",
      birthDate: "",
      phone: "",
      email: "",
      address: "",
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, clientData: formData });
    } else {
      createClientMutation.mutate(formData);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      fullName: client.fullName,
      cpf: client.cpf || "",
      rg: client.rg || "",
      birthDate: client.birthDate || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteClientMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Clientes" subtitle="Gerenciar clientes da pousada" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando clientes...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Clientes" subtitle="Gerenciar clientes da pousada" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Clientes</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingClient ? "Editar Cliente" : "Novo Cliente"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="rg">RG</Label>
                        <Input
                          id="rg"
                          value={formData.rg}
                          onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createClientMutation.isPending || updateClientMutation.isPending}
                      >
                        {editingClient ? "Atualizar" : "Criar"}
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
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.fullName}</TableCell>
                    <TableCell>{client.cpf || "-"}</TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell>{client.email || "-"}</TableCell>
                    <TableCell>{client.address || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(client.id)}
                          disabled={deleteClientMutation.isPending}
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
