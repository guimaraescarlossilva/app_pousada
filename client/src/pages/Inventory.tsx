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
import { Plus, Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertInventoryMovement } from "@shared/schema";

export default function Inventory() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InsertInventoryMovement>({
    productId: 0,
    type: "entry",
    quantity: 1,
    unitCost: "0",
    reason: "",
  });

  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: movements, isLoading: movementsLoading } = useQuery({
    queryKey: ['/api/inventory-movements'],
  });

  const createMovementMutation = useMutation({
    mutationFn: async (movementData: InsertInventoryMovement) => {
      const response = await apiRequest("POST", "/api/inventory-movements", movementData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Movimentação de estoque registrada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      productId: 0,
      type: "entry",
      quantity: 1,
      unitCost: "0",
      reason: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productId === 0) {
      toast({
        title: "Erro",
        description: "Selecione um produto.",
        variant: "destructive",
      });
      return;
    }
    createMovementMutation.mutate(formData);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: "Sem estoque", variant: "destructive" as const, icon: AlertTriangle };
    } else if (stock <= 5) {
      return { label: "Estoque baixo", variant: "secondary" as const, icon: AlertTriangle };
    } else {
      return { label: "Em estoque", variant: "default" as const, icon: Package };
    }
  };

  const lowStockProducts = products?.filter(p => p.currentStock <= 5) || [];
  const outOfStockProducts = products?.filter(p => p.currentStock === 0) || [];

  if (productsLoading || movementsLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Estoque" subtitle="Controle de estoque e movimentações" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando estoque...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Estoque" subtitle="Controle de estoque e movimentações" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Summary Cards */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{products?.length || 0}</p>
                </div>
                <Package className="w-12 h-12 text-primary bg-blue-50 p-2 rounded-lg" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                  <p className="text-3xl font-bold text-warning mt-2">{lowStockProducts.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-warning bg-orange-50 p-2 rounded-lg" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                  <p className="text-3xl font-bold text-error mt-2">{outOfStockProducts.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-error bg-red-50 p-2 rounded-lg" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    R$ {products?.reduce((total, p) => total + (p.currentStock * parseFloat(p.costPrice || "0")), 0).toFixed(2) || "0,00"}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-success bg-green-50 p-2 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Stock */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Estoque Atual
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Movimentação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="productId">Produto</Label>
                        <Select
                          value={formData.productId.toString()}
                          onValueChange={(value) => setFormData({ ...formData, productId: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} (Estoque: {product.currentStock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="type">Tipo de Movimentação</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value as "entry" | "exit" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entrada</SelectItem>
                            <SelectItem value="exit">Saída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quantity">Quantidade</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="unitCost">Custo Unitário</Label>
                          <Input
                            id="unitCost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.unitCost}
                            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reason">Motivo</Label>
                        <Textarea
                          id="reason"
                          value={formData.reason || ""}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          placeholder="Motivo da movimentação"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createMovementMutation.isPending}
                        >
                          Registrar
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
                    <TableHead>Produto</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => {
                    const status = getStockStatus(product.currentStock);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.currentStock} {product.unit}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center w-fit">
                            <status.icon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>R$ {parseFloat(product.salePrice).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Movimentações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Qtd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements?.slice(0, 10).map((movement: any) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{products?.find(p => p.id === movement.productId)?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {movement.type === 'entry' ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          {movement.type === 'entry' ? 'Entrada' : 'Saída'}
                        </div>
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
