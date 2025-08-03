import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<any[]>({
    queryKey: ["/api/events/upcoming"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
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
          <CardTitle>Próximos Eventos</CardTitle>
          <Link href="/events">
            <a className="text-primary hover:text-primary/80 text-sm font-medium">
              Ver todos
            </a>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {events?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum evento agendado
          </p>
        ) : (
          events?.map((event: any) => (
            <div key={event.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs text-primary font-medium">
                    {format(new Date(event.eventDate), 'MMM', { locale: ptBR }).toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {format(new Date(event.eventDate), 'd')}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {event.childName} - {event.age} anos
                </h4>
                <p className="text-sm text-gray-500">
                  {event.client.name} • {event.startTime} às {event.endTime}
                </p>
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency(event.totalValue)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Badge className={getStatusColor(event.status)}>
                  {getStatusText(event.status)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
