import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Shield, Lock } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [loginForm, setLoginForm] = useState({ username: "Buffet", password: "Caieiras23" });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Cake className="text-white text-lg" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Buffet Juniors</h1>
            <p className="text-sm text-gray-600">Sistema de Gestão</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="text-white text-xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre com suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Nome de Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Entrar no Sistema
                  </div>
                )}
              </Button>

              {loginMutation.isError && (
                <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  Credenciais inválidas. Verifique seu usuário e senha.
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="text-center text-xs text-gray-500 border-t bg-gray-50/50">
            <div className="w-full">
              <p>Sistema protegido • Buffet Juniors © 2024</p>
              <p className="mt-1">Usuário padrão: <strong>Buffet</strong> | Senha: <strong>Caieiras23</strong></p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}