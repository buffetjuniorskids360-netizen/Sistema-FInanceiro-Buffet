import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Users, CreditCard, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export function StatsCards() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Receita Total",
      value: `R$ ${stats?.totalRevenue?.toLocaleString() || "0"}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      onClick: () => setLocation("/revenue-total")
    },
    {
      title: "Eventos Este Mês",
      value: `${stats?.eventsThisMonth || 0}`,
      change: "+8.2%",
      icon: Calendar,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      onClick: () => setLocation("/events-month")
    },
    {
      title: "Clientes Ativos",
      value: `${stats?.activeClients || 0}`,
      change: "+4.1%",
      icon: Users,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
      onClick: () => setLocation("/active-clients")
    },
    {
      title: "Pagamentos Pendentes",
      value: `${stats?.pendingPayments || 0}`,
      change: "-2.4%",
      icon: CreditCard,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
      onClick: () => setLocation("/pending-payments")
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
              group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl
              transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-105
              ${card.bgColor} backdrop-blur-sm
              cursor-pointer transform-gpu
              before:absolute before:inset-0 before:bg-gradient-to-r before:${card.color} 
              before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-10
            `}
            style={{
              animationDelay: `${index * 150}ms`,
              animation: 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
            onClick={card.onClick}
          >
            {/* Animated gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-5 transition-all duration-500`} />

            {/* Floating decorative circle */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-all duration-500">
              <div className={`w-full h-full rounded-full bg-gradient-to-br ${card.color} transform translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500`} />
            </div>

            {/* Buffet image for events card */}
            {card.title === "Eventos Este Mês" && (
              <div className="absolute top-2 right-2 w-8 h-8 opacity-20 group-hover:opacity-40 transition-all duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1464207687429-7505649dae38?w=100&h=100&fit=crop&crop=center&auto=format&q=80" 
                  alt="Buffet" 
                  className="w-full h-full rounded-full object-cover border-2 border-white/50 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            )}

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300">
                  {card.value}
                </div>
                <div className={`
                  flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                  ${isNegative 
                    ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' 
                    : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                  }
                  group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 shadow-sm group-hover:shadow-md
                `}>
                  {isNegative ? (
                    <TrendingDown className="h-3 w-3 group-hover:animate-bounce" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3 group-hover:animate-bounce" />
                  )}
                  {card.change}
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-300 group-hover:translate-x-1">
                vs. mês anterior
              </p>
            </CardContent>

            {/* Enhanced shine effect with multiple layers */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-out" />
            </div>

            {/* Pulsing border effect */}
            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/20 transition-all duration-500" />

            {/* Bottom glow effect */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          </Card>
        );
      })}
    </div>
  );
}