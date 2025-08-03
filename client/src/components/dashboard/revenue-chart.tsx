
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ChartData {
  month: string;
  revenue: number;
  events: number;
}

export function RevenueChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<"6M" | "1A">("6M");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const data6M: ChartData[] = [
    { month: "Jul", revenue: 12500, events: 8 },
    { month: "Ago", revenue: 15200, events: 12 },
    { month: "Set", revenue: 18900, events: 15 },
    { month: "Out", revenue: 22100, events: 18 },
    { month: "Nov", revenue: 19800, events: 16 },
    { month: "Dez", revenue: 25400, events: 22 }
  ];

  const data1A: ChartData[] = [
    { month: "Jan", revenue: 8500, events: 5 },
    { month: "Fev", revenue: 9200, events: 7 },
    { month: "Mar", revenue: 11800, events: 9 },
    { month: "Abr", revenue: 13500, events: 11 },
    { month: "Mai", revenue: 15200, events: 13 },
    { month: "Jun", revenue: 14800, events: 12 },
    { month: "Jul", revenue: 16500, events: 14 },
    { month: "Ago", revenue: 18200, events: 16 },
    { month: "Set", revenue: 20900, events: 18 },
    { month: "Out", revenue: 22100, events: 19 },
    { month: "Nov", revenue: 19800, events: 17 },
    { month: "Dez", revenue: 25400, events: 22 }
  ];

  const currentData = selectedPeriod === "6M" ? data6M : data1A;

  const totalRevenue = useMemo(() => 
    currentData.reduce((sum, item) => sum + item.revenue, 0), [currentData]
  );

  const averageRevenue = useMemo(() => 
    Math.round(totalRevenue / currentData.length), [totalRevenue, currentData.length]
  );

  const growth = useMemo(() => {
    if (currentData.length < 2) return 0;
    const lastMonth = currentData[currentData.length - 1].revenue;
    const previousMonth = currentData[currentData.length - 2].revenue;
    return Math.round(((lastMonth - previousMonth) / previousMonth) * 100);
  }, [currentData]);

  return (
    <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Receita Mensal
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Total: R$ {totalRevenue.toLocaleString()}</span>
              <span>Média: R$ {averageRevenue.toLocaleString()}</span>
              <span className={`flex items-center gap-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(growth)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border">
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
                className="rounded-r-none"
              >
                Linha
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("bar")}
                className="rounded-l-none"
              >
                Barra
              </Button>
            </div>
            <div className="flex rounded-lg border">
              <Button
                variant={selectedPeriod === "6M" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("6M")}
                className="rounded-r-none"
              >
                6M
              </Button>
              <Button
                variant={selectedPeriod === "1A" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("1A")}
                className="rounded-l-none"
              >
                1A
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `R$ ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Receita' : 'Eventos'
                  ]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  animationDuration={1000}
                />
              </LineChart>
            ) : (
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `R$ ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Receita' : 'Eventos'
                  ]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
