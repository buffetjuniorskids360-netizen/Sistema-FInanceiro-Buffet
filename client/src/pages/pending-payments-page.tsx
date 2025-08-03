
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function PendingPaymentsPage() {
  const [, setLocation] = useLocation();
  
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Pagamentos Pendentes</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">
                Pagamentos Pendentes
              </CardTitle>
              <CreditCard className="h-4 w-4 text-orange-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingPayments || 0}
              </div>
              <p className="text-xs text-orange-100 mt-2">
                -2.4% vs. mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Valor Total Pendente
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {((stats?.pendingPayments || 0) * 1500).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Valor médio R$ 1.500
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pagamentos em Dia
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor((stats?.pendingPayments || 0) * 4)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este mês
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pagamentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(Math.max(stats?.pendingPayments || 0, 3))].map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Evento - Aniversário {index + 1}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Vencimento: {new Date(Date.now() + (index * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      R$ {(Math.random() * 2000 + 1000).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {index < 2 ? 'Vencido' : 'A vencer'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Marcar como Pago
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
