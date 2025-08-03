import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/ui/stats-card";
import { DollarSign, Calendar, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<{
    monthlyRevenue: number;
    eventsCount: number;
    activeClients: number;
    pendingPayments: number;
  }>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Receita Mensal"
        value={formatCurrency(stats?.monthlyRevenue || 0)}
        change="↗ 12.5% vs mês anterior"
        changeType="positive"
        icon={DollarSign}
        iconColor="bg-green-100 text-green-600"
      />
      
      <StatsCard
        title="Eventos Este Mês"
        value={stats?.eventsCount?.toString() || "0"}
        change="8 agendados"
        changeType="positive"
        icon={Calendar}
        iconColor="bg-blue-100 text-blue-600"
      />
      
      <StatsCard
        title="Clientes Ativos"
        value={stats?.activeClients?.toString() || "0"}
        change="15 novos"
        changeType="positive"
        icon={Users}
        iconColor="bg-purple-100 text-purple-600"
      />
      
      <StatsCard
        title="Pendências"
        value={formatCurrency(stats?.pendingPayments || 0)}
        change="5 pagamentos"
        changeType="neutral"
        icon={AlertTriangle}
        iconColor="bg-yellow-100 text-yellow-600"
      />
    </div>
  );
}
