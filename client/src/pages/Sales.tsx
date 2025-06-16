import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShoppingCart, ConciergeBell, Package, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Service, Reservation, InsertProductSale, InsertServiceSale, Room } from "@shared/schema";

export default function Sales() {
  const [activeTab, setActiveTab] = useState("products");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  
  const [productFormData, setProductFormData] = useState<InsertProductSale>({
    reservationId: 0,
    productId: 0,
    quantity: 1,
    unitPrice: "0",
    totalPrice: "0",
  });

  const [serviceFormData, setServiceFormData] = useState<InsertServiceSale>({
    reservationId: 0,
    serviceId: 0,
    price: "0",
    scheduledDate: undefined,
  });

  const { toast } = useToast();

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });

  const { data: activeReservations } = useQuery<Reservation[]>({
    queryKey: ['/api/reservations/active'],
  });

  const { data: productSales } = useQuery<any[]>({
    queryKey: ['/api/product-sales'],
  });

  const { data: serviceSales } = useQuery<any[]>({
    queryKey: ['/api/service-sales'],
  });

  const createProductSaleMutation = useMutation({
    mutationFn: async (saleData: InsertProductSale) => {
      const response = await apiRequest("POST", "/api/product-sales", saleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast({
        title: "Sucesso",
        description: "Venda de produto registrada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar venda. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateProductSaleMutation = useMutation({
    mutationFn: async ({ id, saleData }: { id: number; saleData: Partial<InsertProductSale> }) => {
      const response = await apiRequest("PUT", `/api/product-sales/${id}`, saleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast({
        title: "Sucesso",
        description: "Venda atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar venda. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteProductSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/product-sales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Sucesso",
        description: "Venda excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir venda. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createServiceSaleMutation = useMutation({
    mutationFn: async (saleData: InsertServiceSale) => {
      const response = await apiRequest("POST", "/api/service-sales", saleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-sales'] });
      setIsServiceDialogOpen(false);
      resetServiceForm();
      toast({
        title: "Sucesso",
        description: "Venda de serviço registrada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar venda de serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetProductForm = () => {
    setProductFormData({
      reservationId: 0,
      productId: 0,
      quantity: 1,
      unitPrice: "0",
      totalPrice: "0",
    });
    setEditingSale(null);
  };

  const resetServiceForm = () => {
    setServiceFormData({
      reservationId: 0,
      serviceId: 0,
      price: "0",
      scheduledDate: undefined,
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productFormData.reservationId === 0 || productFormData.productId === 0) {
      toast({
        title: "Erro",
        description: "Selecione um quarto e um produto.",
        variant: "destructive",
      });
      return;
    }

    if (editingSale) {
      updateProductSaleMutation.mutate({ 
        id: editingSale.id, 
        saleData: productFormData 
      });
    } else {
      createProductSaleMutation.mutate(productFormData);
    }
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceFormData.reservationId === 0 || serviceFormData.serviceId === 0) {
      toast({
        title: "Erro",
        description: "Selecione uma reserva e um serviço.",
        variant: "destructive",
      });
      return;
    }
    createServiceSaleMutation.mutate(serviceFormData);
  };

  const handleProductChange = (productId: number) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const unitPrice = parseFloat(product.salePrice);
      const totalPrice = unitPrice * productFormData.quantity;
      setProductFormData({
        ...productFormData,
        productId,
        unitPrice: product.salePrice,
        totalPrice: totalPrice.toString(),
      });
    }
  };

  const handleQuantityChange = (quantity: number) => {
    const unitPrice = parseFloat(productFormData.unitPrice);
    const totalPrice = unitPrice * quantity;
    setProductFormData({
      ...productFormData,
      quantity,
      totalPrice: totalPrice.toString(),
    });
  };

  const handleServiceChange = (serviceId: number) => {
    const service = services?.find(s => s.id === serviceId);
    if (service) {
      setServiceFormData({
        ...serviceFormData,
        serviceId,
        price: service.price,
      });
    }
  };

  const handleEditSale = (sale: any) => {
    setEditingSale(sale);
    setProductFormData({
      reservationId: sale.reservationId,
      productId: sale.productId,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalPrice: sale.totalPrice,
    });
    setIsProductDialogOpen(true);
  };

  const handleDeleteSale = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta venda?")) {
      deleteProductSaleMutation.mutate(id);
    }
  };

  const getReservationForRoom = (roomId: number) => {
    return activeReservations?.find(r => r.roomId === roomId);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Vendas" subtitle="Gerenciar vendas de produtos e serviços" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center">
              <ConciergeBell className="w-4 h-4 mr-2" />
              Serviços
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Vendas de Produtos
                  </CardTitle>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetProductForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Venda
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingSale ? "Editar Venda de Produto" : "Nova Venda de Produto"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="roomId">Quarto</Label>
                          <Select
                            value={productFormData.reservationId.toString()}
                            onValueChange={(value) => {
                              const roomId = parseInt(value);
                              const reservation = getReservationForRoom(roomId);
                              if (reservation) {
                                setProductFormData({ ...productFormData, reservationId: reservation.id });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um quarto" />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms?.filter(room => room.status === 'occupied').map((room) => (
                                <SelectItem key={room.id} value={room.id.toString()}>
                                  Quarto {room.number} - {room.type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="productId">Produto</Label>
                          <Select
                            value={productFormData.productId.toString()}
                            onValueChange={(value) => handleProductChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.filter(p => p.currentStock > 0).map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} - R$ {parseFloat(product.salePrice).toFixed(2)} (Estoque: {product.currentStock})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="quantity">Quantidade</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              value={productFormData.quantity}
                              onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="unitPrice">Preço Unit.</Label>
                            <Input
                              id="unitPrice"
                              type="number"
                              step="0.01"
                              value={productFormData.unitPrice}
                              onChange={(e) => setProductFormData({ ...productFormData, unitPrice: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="totalPrice">Total</Label>
                            <Input
                              id="totalPrice"
                              type="number"
                              step="0.01"
                              value={productFormData.totalPrice}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createProductSaleMutation.isPending || updateProductSaleMutation.isPending}
                          >
                            {editingSale ? "Atualizar Venda" : "Registrar Venda"}
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
                      <TableHead>Data</TableHead>
                      <TableHead>Quarto</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productSales?.map((sale: any) => {
                      const reservation = activeReservations?.find(r => r.id === sale.reservationId);
                      const room = rooms?.find(r => r.id === reservation?.roomId);
                      
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>Quarto {room?.number || 'N/A'}</TableCell>
                          <TableCell>{products?.find(p => p.id === sale.productId)?.name || 'N/A'}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>R$ {parseFloat(sale.unitPrice).toFixed(2)}</TableCell>
                          <TableCell>R$ {parseFloat(sale.totalPrice).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSale(sale)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSale(sale.id)}
                                disabled={deleteProductSaleMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <ConciergeBell className="w-5 h-5 mr-2" />
                    Vendas de Serviços
                  </CardTitle>
                  <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetServiceForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Venda
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Nova Venda de Serviço</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleServiceSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="reservationId">Reserva/Quarto</Label>
                          <Select
                            value={serviceFormData.reservationId.toString()}
                            onValueChange={(value) => setServiceFormData({ ...serviceFormData, reservationId: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma reserva" />
                            </SelectTrigger>
                            <SelectContent>
                              {activeReservations?.map((reservation) => (
                                <SelectItem key={reservation.id} value={reservation.id.toString()}>
                                  Reserva #{reservation.id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="serviceId">Serviço</Label>
                          <Select
                            value={serviceFormData.serviceId.toString()}
                            onValueChange={(value) => handleServiceChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um serviço" />
                            </SelectTrigger>
                            <SelectContent>
                              {services?.map((service) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  {service.name} - R$ {parseFloat(service.price).toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Valor</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={serviceFormData.price}
                              onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="scheduledDate">Data Agendada</Label>
                            <Input
                              id="scheduledDate"
                              type="datetime-local"
                              value={serviceFormData.scheduledDate ? new Date(serviceFormData.scheduledDate).toISOString().slice(0, 16) : ''}
                              onChange={(e) => setServiceFormData({ ...serviceFormData, scheduledDate: e.target.value ? new Date(e.target.value) : undefined })}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createServiceSaleMutation.isPending}
                          >
                            Registrar Venda
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
                      <TableHead>Data</TableHead>
                      <TableHead>Reserva</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Agendado para</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceSales?.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>#{sale.reservationId}</TableCell>
                        <TableCell>{services?.find(s => s.id === sale.serviceId)?.name || 'N/A'}</TableCell>
                        <TableCell>R$ {parseFloat(sale.price).toFixed(2)}</TableCell>
                        <TableCell>
                          {sale.scheduledDate ? new Date(sale.scheduledDate).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                            sale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sale.status === 'completed' ? 'Concluído' :
                             sale.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                          </span>
                        </TableCell>
                      </TableRow>
                    )) || []}
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
