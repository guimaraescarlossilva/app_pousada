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
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, InsertUser } from "@shared/schema";

export default function Users() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<InsertUser>({
    fullName: "",
    role: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    permissions: {},
  });

  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<InsertUser> }) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      role: "",
      phone: "",
      email: "",
      username: "",
      password: "",
      permissions: {},
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, userData: formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      role: user.role,
      phone: user.phone || "",
      email: user.email || "",
      username: user.username,
      password: "",
      permissions: user.permissions || {},
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      manager: { label: "Gerente", variant: "default" },
      receptionist: { label: "Recepcionista", variant: "secondary" },
      staff: { label: "Funcionário", variant: "secondary" },
    };
    
    const roleInfo = roleMap[role] || { label: role, variant: "secondary" as const };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Funcionários" subtitle="Gerenciar usuários do sistema" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando funcionários...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Funcionários" subtitle="Gerenciar usuários do sistema" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Funcionários</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Funcionário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? "Editar Funcionário" : "Novo Funcionário"}
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
                    <div>
                      <Label htmlFor="role">Função</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="receptionist">Recepcionista</SelectItem>
                          <SelectItem value="staff">Funcionário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    <div>
                      <Label htmlFor="username">Login</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">
                        {editingUser ? "Nova Senha (deixe em branco para manter)" : "Senha"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createUserMutation.isPending || updateUserMutation.isPending}
                      >
                        {editingUser ? "Atualizar" : "Criar"}
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
                  <TableHead>Função</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteUserMutation.isPending}
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
