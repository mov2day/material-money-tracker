
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Transaction } from '@/pages/Index';

interface IncomeChartProps {
  transactions: Transaction[];
}

const INCOME_COLORS = {
  salary: '#10B981',
  freelance: '#3B82F6',
  investment: '#8B5CF6',
  business: '#F59E0B',
  gift: '#EC4899',
  other: '#6B7280'
};

const IncomeChart: React.FC<IncomeChartProps> = ({ transactions }) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');

  const getIncomeByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    incomeTransactions.forEach(income => {
      categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount,
      color: INCOME_COLORS[category as keyof typeof INCOME_COLORS] || INCOME_COLORS.other
    })).sort((a, b) => b.value - a.value);
  };

  const getMonthlyIncome = () => {
    const monthlyData: { [key: string]: { total: number; [category: string]: number } } = {};
    
    incomeTransactions.forEach(income => {
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0 };
      }
      
      monthlyData[monthKey].total += income.amount;
      monthlyData[monthKey][income.category] = (monthlyData[monthKey][income.category] || 0) + income.amount;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        ...data
      }));
  };

  const incomeByCategory = getIncomeByCategory();
  const monthlyIncome = getMonthlyIncome();
  const totalIncome = incomeTransactions.reduce((sum, income) => sum + income.amount, 0);
  const averageMonthlyIncome = monthlyIncome.length > 0 ? 
    monthlyIncome.reduce((sum, month) => sum + month.total, 0) / monthlyIncome.length : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: ${entry.value?.toLocaleString() || 0}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalIncome) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p style={{ color: payload[0].payload.color }}>
            ${payload[0].value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (incomeTransactions.length === 0) {
    return (
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text">Income Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>No income data available.</p>
            <p className="text-sm mt-2">Add some income transactions to see insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Summary */}
      <Card className="material-card col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="gradient-text">Income Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
              <p className="text-sm text-green-600">Total Income</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">${averageMonthlyIncome.toFixed(0)}</p>
              <p className="text-sm text-emerald-600">Monthly Average</p>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <p className="text-2xl font-bold text-teal-600">{incomeByCategory.length}</p>
              <p className="text-sm text-teal-600">Income Sources</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-cyan-600">{incomeTransactions.length}</p>
              <p className="text-sm text-cyan-600">Transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income by Source - Pie Chart */}
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text">Income by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Income Sources Breakdown */}
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text">Source Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incomeByCategory.map((category, index) => {
              const percentage = (category.value / totalIncome) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-green-600 font-bold">${category.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: category.color 
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {percentage.toFixed(1)}% of total income
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income Trend */}
      {monthlyIncome.length > 0 && (
        <Card className="material-card col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="gradient-text">Monthly Income Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyIncome}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Total Income"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Income by Category */}
      {monthlyIncome.length > 0 && (
        <Card className="material-card col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="gradient-text">Monthly Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyIncome}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(INCOME_COLORS).map(category => (
                    <Bar 
                      key={category}
                      dataKey={category} 
                      stackId="income"
                      fill={INCOME_COLORS[category as keyof typeof INCOME_COLORS]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncomeChart;
