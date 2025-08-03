
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatsData {
  totalClients: number;
  totalEvents: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeEvents: number;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const cards = [
    {
      title: "Total de Clientes",
      value: stats?.totalClients || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Eventos do Mês",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Eventos Ativos",
      value: stats?.activeEvents || 0,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+5%",
      changeType: "positive" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                {card.value}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    card.changeType === 'positive' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {card.change}
                </Badge>
                <span className="text-xs text-gray-500">vs. mês anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
