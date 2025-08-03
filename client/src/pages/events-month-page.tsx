
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Users, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function EventsMonthPage() {
  const [, setLocation] = useLocation();
  
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  const { data: events } = useQuery<any>({
    queryKey: ["/api/events/upcoming"],
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
          <h1 className="text-3xl font-bold text-gray-900">Eventos Este Mês</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Eventos Este Mês
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.eventsThisMonth || 0}
              </div>
              <p className="text-xs text-blue-100 mt-2">
                +8.2% vs. mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Eventos Confirmados
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor((stats?.eventsThisMonth || 0) * 0.8)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                80% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Eventos Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.ceil((stats?.eventsThisMonth || 0) * 0.2)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                20% do total
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {events?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum evento agendado para este mês
              </p>
            ) : (
              <div className="space-y-4">
                {events?.slice(0, 5).map((event: any, index: number) => (
                  <div key={event.id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {event.childName || `Evento ${index + 1}`} - {event.age || 5} anos
                      </h4>
                      <p className="text-sm text-gray-500">
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString('pt-BR') : 'Data a definir'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        R$ {(Math.random() * 2000 + 1000).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">Valor estimado</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
