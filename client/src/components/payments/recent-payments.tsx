import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { CheckCircle, CreditCard, Clock, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentPayments() {
  const [, setLocation] = useLocation();
  const { data: payments, isLoading } = useQuery<any[]>({
    queryKey: ["/api/payments/recent"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getPaymentIcon = (method: string, status: string) => {
    if (status === 'pending') return Clock;
    if (method === 'card') return CreditCard;
    if (method === 'cash') return DollarSign;
    return CheckCircle;
  };

  const getPaymentColor = (status: string) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const formatCurrency = (value: string) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(Number(value));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pagamentos Recentes</CardTitle>
          <a onClick={() => setLocation("/payments")} className="text-primary hover:text-primary/80 text-sm font-medium cursor-pointer">
              Ver todos
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {payments?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum pagamento registrado
          </p>
        ) : (
          payments?.map((payment: any) => {
            const Icon = getPaymentIcon(payment.paymentMethod, payment.status);

            return (
              <div key={payment.id} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPaymentColor(payment.status)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {payment.event.client.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {payment.description || `${payment.event.childName} - ${payment.paymentMethod}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${payment.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(payment.paymentDate), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}