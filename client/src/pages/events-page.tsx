
/* @jsxImportSource react */
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEventSchema } from "@shared/schema";
import { toDecimalString, toDateYYYYMMDD, toTimeHHMM } from "@/lib/utils";
import { Calendar, Plus, Users, Clock, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";
import EventModalDefault from "@/components/events/event-modal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";
import type { ReactElement } from "react";

const EventModal = EventModalDefault;
 
function EventsScaffold({
  sidebarOpen,
  setSidebarOpen,
  showEventModal,
  handleCloseModal,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  showEventModal: boolean;
  handleCloseModal: () => void;
}) {
  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar />
      {/* Use shared EventModal to avoid prop type mismatch on Dialog */}
      <EventModal isOpen={showEventModal} onClose={handleCloseModal} />
    </SidebarProvider>
  );
}
 
export default function EventsPage() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    clientId: "",
    childName: "",
    eventDate: "",
    eventType: "",
    guestCount: "",
    venue: "",
    theme: "",
    specialRequests: "",
    budget: "",
    status: "scheduled",
  });

  const { data: events, isLoading } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  const { data: clients } = useQuery<any[]>({
    queryKey: ["/api/clients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const validatedData = insertEventSchema.parse(data);
      const res = await apiRequest("POST", "/api/events", validatedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso.",
      });
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNewEvent = () => {
    setFormData({
      clientId: "",
      childName: "",
      eventDate: "",
      eventType: "",
      guestCount: "",
      venue: "",
      theme: "",
      specialRequests: "",
      budget: "",
      status: "scheduled",
    });
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map UI fields to backend event schema without changing UI
    // eventDate is datetime-local (YYYY-MM-DDTHH:mm). Derive date and time.
    const dt = formData.eventDate || "";
    const hasT = dt.includes("T");
    const datePart = hasT ? dt.split("T")[0] : dt;
    const timePart = hasT ? dt.split("T")[1] : "00:00";

    const payload = {
      childName: formData.childName,
      clientId: formData.clientId,
      eventDate: toDateYYYYMMDD(datePart),
      startTime: toTimeHHMM(timePart),
      endTime: toTimeHHMM(timePart),
      guestCount: Number(formData.guestCount || 0),
      totalValue: toDecimalString(formData.budget || "0"),
      notes: formData.specialRequests || "",
      // status is accepted by backend schema; keep as provided if present
      status: formData.status || "scheduled",
    };

    // Validate and submit against shared zod schema
    const validated = insertEventSchema.parse(payload);
    createMutation.mutate(validated);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  const formatCurrency = (value: string | number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(Number(value));

  return (
    <div className="min-h-screen flex">
      <EventsScaffold
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showEventModal={showEventModal}
        handleCloseModal={handleCloseModal}
      />
 
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
 
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Eventos</h2>
                <p className="text-sm text-gray-500">Gerencie todas as festas e eventos</p>
              </div>
            </div>
            <Button onClick={handleNewEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : events && events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum evento registrado
              </h3>
              <p className="text-gray-500 mb-4">
                Comece criando seu primeiro evento
              </p>
              <Button onClick={handleNewEvent}>
                Criar Primeiro Evento
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((event: any) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {event.childName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.client.name}
                        </p>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusText(event.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.eventDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {event.guestCount} convidados
                    </div>
                    
                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {event.venue}
                      </div>
                    )}
                    
                    {event.theme && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Tema:</span>
                        <span className="ml-1 text-gray-600">{event.theme}</span>
                      </div>
                    )}
                    
                    {event.budget && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Orçamento:</span>
                        <span className="ml-1 text-green-600 font-semibold">
                          {formatCurrency(event.budget)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {event.client.phone}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {event.client.email}
                    </div>
                    
                    {event.specialRequests && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Observações:</span>
                        <p className="mt-1 text-gray-600 text-xs leading-relaxed">
                          {event.specialRequests}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
