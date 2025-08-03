import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export function RevenueChart() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Receita Mensal</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">6M</Button>
            <Button size="sm">1A</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Gráfico de receita mensal</p>
            <p className="text-sm text-gray-400 mt-2">
              Integração com Chart.js será implementada aqui
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
