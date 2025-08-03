import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Eventos", href: "/events", icon: Calendar },
  { name: "Pagamentos", href: "/payments", icon: CreditCard },
  { name: "Documentos", href: "/documents", icon: FileText },
  { name: "Receitas", href: "/revenue", icon: BarChart3 },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/auth");
    },
  });

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">BJ</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Buffet Juniors</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11 transition-all duration-300 transform hover:scale-105",
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
              onClick={() => setLocation(item.href)}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors duration-300">
              {user?.name || "Usuário"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">
              {user?.email || "email@exemplo.com"}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? "Saindo..." : "Sair"}
          </Button>
        </div>
      </div>
    </div>
  );
}