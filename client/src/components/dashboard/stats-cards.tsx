import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Users, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export function StatsCards() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  const cards = [
    {
      title: "Receita Total",
      value: `R$ ${stats?.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      change: "+12.5%",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-700 dark:text-green-300",
      onClick: () => setLocation("/receita-total"),
    },
    {
      title: "Eventos Este Mês",
      value: stats?.eventsThisMonth || 0,
      icon: Calendar,
      change: "+8.2%",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-300",
      onClick: () => setLocation("/eventos-mes"),
    },
    {
      title: "Clientes Ativos",
      value: stats?.activeClients || 0,
      icon: Users,
      change: "+4.1%",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-700 dark:text-purple-300",
      onClick: () => setLocation("/clientes-ativos"),
    },
    {
      title: "Pagamentos Pendentes",
      value: stats?.pendingPayments || 0,
      icon: CreditCard,
      change: "-2.4%",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-700 dark:text-orange-300",
      onClick: () => setLocation("/pagamentos-pendentes"),
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isNegative = card.change.startsWith('-');

        return (
          <Card 
            key={card.title} 
            className={`
              group relative overflow-hidden border-0 shadow-lg hover:shadow-xl
              transition-all duration-300 ease-out hover:-translate-y-1
              ${card.bgColor} backdrop-blur-sm
              cursor-pointer
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
            onClick={card.onClick}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className={`w-full h-full rounded-full bg-gradient-to-br ${card.color} transform translate-x-8 -translate-y-8`} />
            </div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} transform group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                  {card.value}
                </div>
                <div className={`
                  flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                  ${isNegative 
                    ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' 
                    : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                  }
                  group-hover:scale-105 transition-transform duration-200
                `}>
                  {isNegative ? (
                    <TrendingUp className="h-3 w-3 rotate-180" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                  {card.change}
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
                vs. mês anterior
              </p>
            </CardContent>

            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-700 ease-out" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}