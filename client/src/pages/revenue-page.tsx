import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, CreditCard, Smartphone } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

const mockRevenueData = [
  {
    id: "1",
    date: "15/01/2024",
    description: "Festa de Aniversário - João",
    amount: 2500.00,
    method: "dinheiro",
    extract: "EXT-001",
  },
  {
    id: "2",
    date: "18/01/2024",
    description: "Evento Corporativo - Empresa ABC",
    amount: 4200.00,
    method: "cartao",
    extract: "EXT-002",
  },
  {
    id: "3",
    date: "22/01/2024",
    description: "Festa Infantil - Maria",
    amount: 1800.00,
    method: "pix",
    extract: "EXT-003",
  },
  {
    id: "4",
    date: "25/01/2024",
    description: "Casamento - Pedro e Ana",
    amount: 8500.00,
    method: "cartao",
    extract: "EXT-004",
  },
];

const getPaymentIcon = (method: string) => {
  switch (method) {
    case "dinheiro":
      return <DollarSign className="h-4 w-4" />;
    case "cartao":
      return <CreditCard className="h-4 w-4" />;
    case "pix":
      return <Smartphone className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

const getPaymentBadgeVariant = (method: string) => {
  switch (method) {
    case "dinheiro":
      return "default";
    case "cartao":
      return "secondary";
    case "pix":
      return "outline";
    default:
      return "default";
  }
};

export default function RevenuePage() {
  const [, setLocation] = useLocation();

  const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Receita Total</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo da Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-gray-600">Total de {mockRevenueData.length} transações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extratos e Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRevenueData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPaymentIcon(item.method)}
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">
                          {item.date} • Extrato: {item.extract}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <Badge variant={getPaymentBadgeVariant(item.method)}>
                        {item.method.toUpperCase()}
                      </Badge>
                      <div className="text-lg font-semibold text-green-600">
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo por Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["dinheiro", "cartao", "pix"].map((method) => {
                  const methodData = mockRevenueData.filter(item => item.method === method);
                  const methodTotal = methodData.reduce((sum, item) => sum + item.amount, 0);

                  return (
                    <div key={method} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getPaymentIcon(method)}
                        <h3 className="font-medium">{method.toUpperCase()}</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {methodTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {methodData.length} transação(ões)
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}