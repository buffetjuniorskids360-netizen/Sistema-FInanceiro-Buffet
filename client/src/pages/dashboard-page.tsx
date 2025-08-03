import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { UpcomingEvents } from "@/components/events/upcoming-events";
import { RecentPayments } from "@/components/payments/recent-payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserPlus, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          subtitle="Visão geral do seu negócio"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-auto p-6">
          {/* Stats Overview */}
          <div className="mb-8">
            <StatsCards />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <RevenueChart />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto p-3" onClick={() => setLocation("/events")}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Plus className="text-primary w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Novo Evento</p>
                      <p className="text-sm text-gray-500">Agendar festa</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-3" onClick={() => setLocation("/clients")}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <UserPlus className="text-secondary w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Adicionar Cliente</p>
                      <p className="text-sm text-gray-500">Cadastrar novo</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-3" onClick={() => setLocation("/payments")}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-600 w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Registrar Pagamento</p>
                      <p className="text-sm text-gray-500">Lançar entrada</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingEvents />
            <RecentPayments />
          </div>
        </div>
      </main>
    </div>
  );
}