import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<InsertProduct>({
    name: "",
    category: "",
    unit: "",
    salePrice: "0",
    costPrice: "0",
    currentStock: 0,
    supplier: "",
  });

  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: number; productData: Partial<InsertProduct> }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      unit: "",
      salePrice: "0",
      costPrice: "0",
      currentStock: 0,
      supplier: "",
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, productData: formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      salePrice: product.salePrice,
      costPrice: product.costPrice || "0",
      currentStock: product.currentStock,
      supplier: product.supplier || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>;
    } else if (stock <= 5) {
      return <Badge variant="secondary">Estoque baixo</Badge>;
    } else {
      return <Badge variant="default">Em estoque</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Produtos" subtitle="Gerenciar produtos da pousada" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando produtos...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Produtos" subtitle="Gerenciar produtos da pousada" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Produtos</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unidade</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          placeholder="un, L, kg, etc."
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                        <Input
                          id="salePrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentStock">Estoque Atual</Label>
                        <Input
                          id="currentStock"
                          type="number"
                          min="0"
                          value={formData.currentStock}
                          onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="supplier">Fornecedor</Label>
                        <Input
                          id="supplier"
                          value={formData.supplier}
                          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      >
                        {editingProduct ? "Atualizar" : "Criar"}
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
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>R$ {parseFloat(product.salePrice).toFixed(2)}</TableCell>
                    <TableCell>{product.currentStock}</TableCell>
                    <TableCell>{getStockBadge(product.currentStock)}</TableCell>
                    <TableCell>{product.supplier || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteProductMutation.isPending}
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
