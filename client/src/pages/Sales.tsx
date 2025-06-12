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
import { Plus, ShoppingCart, ConciergeBell, Package } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Service, Reservation, InsertProductSale, InsertServiceSale } from "@shared/schema";

export default function Sales() {
  const [activeTab, setActiveTab] = useState("products");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  
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

  const { data: activeReservations } = useQuery<Reservation[]>({
    queryKey: ['/api/reservations/active'],
  });

  const { data: productSales } = useQuery({
    queryKey: ['/api/product-sales'],
  });

  const { data: serviceSales } = useQuery({
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
        description: "Selecione uma reserva e um produto.",
        variant: "destructive",
      });
      return;
    }
    createProductSaleMutation.mutate(productFormData);
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
                        <DialogTitle>Nova Venda de Produto</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="reservationId">Reserva/Quarto</Label>
                          <Select
                            value={productFormData.reservationId.toString()}
                            onValueChange={(value) => setProductFormData({ ...productFormData, reservationId: parseInt(value) })}
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
                            disabled={createProductSaleMutation.isPending}
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
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productSales?.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>#{sale.reservationId}</TableCell>
                        <TableCell>{products?.find(p => p.id === sale.productId)?.name || 'N/A'}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>R$ {parseFloat(sale.unitPrice).toFixed(2)}</TableCell>
                        <TableCell>R$ {parseFloat(sale.totalPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    )) || []}
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
