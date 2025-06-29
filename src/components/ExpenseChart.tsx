
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Transaction } from '@/pages/Index';

interface ExpenseChartProps {
  transactions: Transaction[];
}

const COLORS = {
  food: '#F59E0B',
  transportation: '#8B5CF6',
  entertainment: '#EC4899',
  utilities: '#06B6D4',
  healthcare: '#84CC16',
  shopping: '#F97316',
  education: '#10B981',
  other: '#6B7280'
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount,
      color: COLORS[category as keyof typeof COLORS] || COLORS.other
    })).sort((a, b) => b.value - a.value);
  };

  const getMonthlyExpenses = () => {
    const monthlyData: { [key: string]: { [category: string]: number } } = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }
      
      monthlyData[monthKey][expense.category] = (monthlyData[monthKey][expense.category] || 0) + expense.amount;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, categories]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        ...categories
      }));
  };

  const expensesByCategory = getExpensesByCategory();
  const monthlyExpenses = getMonthlyExpenses();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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
      const percentage = ((payload[0].value / totalExpenses) * 100).toFixed(1);
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

  if (expenses.length === 0) {
    return (
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text">Expense Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>No expense data available.</p>
            <p className="text-sm mt-2">Add some expense transactions to see insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expense Summary */}
      <Card className="material-card col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="gradient-text">Expense Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-red-600">Total Expenses</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">${(totalExpenses / expenses.length).toFixed(0)}</p>
              <p className="text-sm text-orange-600">Average Transaction</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{expensesByCategory.length}</p>
              <p className="text-sm text-yellow-600">Categories</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{expenses.length}</p>
              <p className="text-sm text-purple-600">Transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses by Category - Pie Chart */}
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown - Bar Chart */}
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByCategory} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={80} />
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: '#1f2937' }}
                />
                <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expense Trends */}
      {monthlyExpenses.length > 0 && (
        <Card className="material-card col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="gradient-text">Monthly Expense Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(COLORS).map(category => (
                    <Bar 
                      key={category}
                      dataKey={category} 
                      stackId="expenses"
                      fill={COLORS[category as keyof typeof COLORS]} 
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

export default ExpenseChart;
