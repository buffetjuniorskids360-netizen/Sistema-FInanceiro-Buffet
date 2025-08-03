
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, Smartphone, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RevenuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: payments, isLoading } = useQuery<any[]>({
    queryKey: ["/api/payments"],
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  const formatCurrency = (value: string | number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(Number(value));

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return DollarSign;
      case 'card': return CreditCard;
      case 'transfer': return Smartphone;
      case 'installment': return CreditCard;
      default: return DollarSign;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'card': return 'Cartão';
      case 'transfer': return 'PIX/Transferência';
      case 'installment': return 'Parcelado';
      default: return method;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'installment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const revenueByMethod = payments?.reduce((acc, payment) => {
    if (payment.status === 'completed') {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + Number(payment.amount);
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const totalRevenue = Object.values(revenueByMethod).reduce((sum, value) => sum + value, 0);

  const completedPayments = payments?.filter(p => p.status === 'completed') || [];
  const pendingPayments = payments?.filter(p => p.status === 'pending') || [];

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Receita Detalhada" 
          subtitle="Extratos e informações financeiras"
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Resumo da Receita */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Recebido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </div>
              </CardContent>
            </Card>

            {Object.entries(revenueByMethod).map(([method, amount]) => {
              const Icon = getPaymentIcon(method);
              return (
                <Card key={method}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {getMethodText(method)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(amount)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="completed" className="space-y-6">
            <TabsList>
              <TabsTrigger value="completed">Pagamentos Recebidos</TabsTrigger>
              <TabsTrigger value="pending">Pagamentos Pendentes</TabsTrigger>
              <TabsTrigger value="by-method">Por Método</TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : completedPayments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum pagamento recebido
                    </h3>
                  </CardContent>
                </Card>
              ) : (
                completedPayments.map((payment: any) => {
                  const Icon = getPaymentIcon(payment.paymentMethod);
                  
                  return (
                    <Card key={payment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">
                                {payment.event.client.name}
                              </h3>
                              <Badge className={getMethodColor(payment.paymentMethod)}>
                                {getMethodText(payment.paymentMethod)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {payment.description || `${payment.event.childName} - Festa`}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingPayments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum pagamento pendente
                    </h3>
                  </CardContent>
                </Card>
              ) : (
                pendingPayments.map((payment: any) => {
                  const Icon = getPaymentIcon(payment.paymentMethod);
                  
                  return (
                    <Card key={payment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">
                                {payment.event.client.name}
                              </h3>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pendente
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {payment.description || `${payment.event.childName} - Festa`}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-yellow-600">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="by-method" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(revenueByMethod).map(([method, amount]) => {
                  const Icon = getPaymentIcon(method);
                  const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0;
                  
                  return (
                    <Card key={method}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="w-5 h-5" />
                          {getMethodText(method)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {formatCurrency(amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {percentage}% do total
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
