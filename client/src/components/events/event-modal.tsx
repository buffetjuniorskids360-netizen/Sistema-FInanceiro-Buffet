import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEventSchema } from "@shared/schema";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: any;
}

export function EventModal({ isOpen, onClose, event }: EventModalProps) {
  const { toast } = useToast();
  const isEditing = !!event;

  const [formData, setFormData] = useState({
    childName: event?.childName || "",
    age: event?.age || "",
    clientId: event?.clientId || "",
    eventDate: event?.eventDate || "",
    startTime: event?.startTime || "",
    endTime: event?.endTime || "",
    guestCount: event?.guestCount || "",
    totalValue: event?.totalValue || "",
    notes: event?.notes || "",
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
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const validatedData = insertEventSchema.partial().parse(data);
      const res = await apiRequest("PUT", `/api/events/${event.id}`, validatedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      childName: "",
      age: "",
      clientId: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      guestCount: "",
      totalValue: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      age: parseInt(formData.age),
      guestCount: parseInt(formData.guestCount),
      totalValue: formData.totalValue.replace(/\D/g, '') // Remove non-numeric characters
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleClose = () => {
    onClose();
    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="childName">Nome da Criança</Label>
              <Input
                id="childName"
                value={formData.childName}
                onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
                placeholder="Ex: João Silva"
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Ex: 8"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clientId">Responsável</Label>
            <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="eventDate">Data do Evento</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Horário</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  placeholder="Início"
                  required
                />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  placeholder="Fim"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="guestCount">Número de Convidados</Label>
              <Input
                id="guestCount"
                type="number"
                value={formData.guestCount}
                onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                placeholder="Ex: 25"
                required
              />
            </div>
            <div>
              <Label htmlFor="totalValue">Valor Total</Label>
              <Input
                id="totalValue"
                value={formData.totalValue}
                onChange={(e) => setFormData(prev => ({ ...prev, totalValue: e.target.value }))}
                placeholder="R$ 0,00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informações adicionais sobre o evento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) 
                ? "Salvando..." 
                : isEditing 
                  ? "Atualizar Evento" 
                  : "Criar Evento"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
