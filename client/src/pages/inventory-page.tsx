import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventorySchema, type InsertInventory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, AlertTriangle, TrendingUp, Boxes, Edit, Trash2 } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitCost: string;
  supplier: string;
  lastRestockDate: string;
  expirationDate: string;
  location: string;
}

export default function InventoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertInventory>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      currentStock: 0,
      minimumStock: 0,
      unit: "",
      unitCost: "0",
      supplier: "",
      location: "",
    },
  });

  const { data: inventory = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertInventory) => {
      return await apiRequest("/api/inventory", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Item adicionado ao estoque com sucesso!" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao adicionar item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/inventory/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Item removido do estoque!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover item", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertInventory) => {
    createMutation.mutate(data);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minimumStock) {
      return <Badge variant="destructive">Estoque Baixo</Badge>;
    } else if (item.currentStock <= item.minimumStock * 1.5) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Normal</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      decorations: "bg-pink-100 text-pink-800",
      food: "bg-orange-100 text-orange-800",
      toys: "bg-blue-100 text-blue-800",
      equipment: "bg-green-100 text-green-800",
      supplies: "bg-purple-100 text-purple-800",
    };
    
    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {category}
      </Badge>
    );
  };

  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * parseFloat(item.unitCost || "0")), 0);
  const lowStockCount = lowStockItems.length;

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
                <p className="text-gray-600">Gestão completa de materiais e suprimentos</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Item ao Estoque</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Item</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do item" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="decorations">Decorações</SelectItem>
                                <SelectItem value="food">Alimentação</SelectItem>
                                <SelectItem value="toys">Brinquedos</SelectItem>
                                <SelectItem value="equipment">Equipamentos</SelectItem>
                                <SelectItem value="supplies">Suprimentos</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="currentStock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estoque Atual</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="minimumStock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estoque Mínimo</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidade</FormLabel>
                              <FormControl>
                                <Input placeholder="peças, kg, litros..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="unitCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custo Unitário</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do fornecedor" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização</FormLabel>
                            <FormControl>
                              <Input placeholder="Local de armazenamento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                          {createMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <p className="text-xs text-muted-foreground">Diferentes produtos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">Valor do estoque</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
                  <p className="text-xs text-muted-foreground">Itens precisam reposição</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorias</CardTitle>
                  <Boxes className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Set(inventory.map(item => item.category)).size}</div>
                  <p className="text-xs text-muted-foreground">Tipos de produto</p>
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alert */}
            {lowStockCount > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alerta de Estoque Baixo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-700 mb-3">
                    {lowStockCount} {lowStockCount === 1 ? 'item precisa' : 'itens precisam'} de reposição urgente.
                  </p>
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.name}</span>
                        <span className="text-yellow-800 font-medium">
                          {item.currentStock} / {item.minimumStock} {item.unit}
                        </span>
                      </div>
                    ))}
                    {lowStockCount > 3 && (
                      <p className="text-xs text-yellow-600">...e mais {lowStockCount - 3} itens</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Inventário Completo</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando inventário...</div>
                ) : inventory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum item no estoque ainda.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-2">Item</th>
                          <th className="pb-2">Categoria</th>
                          <th className="pb-2">Estoque</th>
                          <th className="pb-2">Unidade</th>
                          <th className="pb-2">Custo Unit.</th>
                          <th className="pb-2">Fornecedor</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {inventory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-3">
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-500">{item.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3">{getCategoryBadge(item.category)}</td>
                            <td className="py-3">
                              <div className="font-medium">{item.currentStock}</div>
                              <div className="text-xs text-gray-500">Mín: {item.minimumStock}</div>
                            </td>
                            <td className="py-3">{item.unit}</td>
                            <td className="py-3">R$ {parseFloat(item.unitCost || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="py-3">{item.supplier || "-"}</td>
                            <td className="py-3">{getStockStatus(item)}</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteMutation.mutate(item.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}