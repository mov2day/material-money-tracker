
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { Transaction } from '@/pages/Index';
import { Subscription } from '@/components/SubscriptionTracker';

interface BudgetOverviewProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
}

const COLORS = {
  income: '#10B981',
  expense: '#EF4444',
  savings: '#3B82F6',
  subscription: '#F59E0B',
  projected: '#8B5CF6',
  food: '#F59E0B',
  transportation: '#8B5CF6',
  entertainment: '#EC4899',
  utilities: '#06B6D4',
  healthcare: '#84CC16',
  shopping: '#F97316',
  other: '#6B7280'
};

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ transactions, subscriptions }) => {
  const getFinancialBreakdown = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSavings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
    
    const monthlySubscriptions = subscriptions
      .filter(sub => sub.isActive)
      .reduce((total, sub) => {
        const multiplier = { weekly: 4.33, monthly: 1, quarterly: 0.33, yearly: 0.083 }[sub.frequency];
        return total + (sub.amount * multiplier);
      }, 0);

    return [
      { name: 'Income', value: totalIncome, color: COLORS.income, percentage: 100 },
      { name: 'Expenses', value: totalExpenses, color: COLORS.expense, percentage: (totalExpenses / totalIncome) * 100 },
      { name: 'Subscriptions', value: monthlySubscriptions * 12, color: COLORS.subscription, percentage: ((monthlySubscriptions * 12) / totalIncome) * 100 },
      { name: 'Savings', value: totalSavings, color: COLORS.savings, percentage: (totalSavings / totalIncome) * 100 }
    ];
  };

  const getProjectedData = () => {
    const now = new Date();
    const projectedMonths = [];
    
    // Get last 3 months of actual data
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === date.getFullYear() && tDate.getMonth() === date.getMonth();
      });
      
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const savings = monthTransactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
      
      const monthlySubCost = subscriptions
        .filter(sub => sub.isActive)
        .reduce((total, sub) => {
          const multiplier = { weekly: 4.33, monthly: 1, quarterly: 0.33, yearly: 0.083 }[sub.frequency];
          return total + (sub.amount * multiplier);
        }, 0);

      projectedMonths.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income,
        expenses,
        savings,
        subscriptions: monthlySubCost,
        type: 'actual'
      });
    }

    // Calculate averages for projection
    const avgIncome = projectedMonths.reduce((sum, m) => sum + m.income, 0) / projectedMonths.length;
    const avgExpenses = projectedMonths.reduce((sum, m) => sum + m.expenses, 0) / projectedMonths.length;
    const avgSavings = projectedMonths.reduce((sum, m) => sum + m.savings, 0) / projectedMonths.length;
    const currentSubCost = projectedMonths[projectedMonths.length - 1]?.subscriptions || 0;

    // Add 3 months of projected data
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      projectedMonths.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: avgIncome * 1.02, // 2% growth assumption
        expenses: avgExpenses * 1.01, // 1% inflation assumption
        savings: avgSavings,
        subscriptions: currentSubCost,
        type: 'projected'
      });
    }

    return projectedMonths;
  };

  const getCashFlowTrend = () => {
    const monthlyData: { [key: string]: { income: number; expenses: number; subscriptions: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, subscriptions: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });

    // Add subscription costs to each month
    const monthlySubCost = subscriptions
      .filter(sub => sub.isActive)
      .reduce((total, sub) => {
        const multiplier = { weekly: 4.33, monthly: 1, quarterly: 0.33, yearly: 0.083 }[sub.frequency];
        return total + (sub.amount * multiplier);
      }, 0);

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        ...data,
        subscriptions: monthlySubCost,
        netCashFlow: data.income - data.expenses - monthlySubCost
      }));
  };

  const financialBreakdown = getFinancialBreakdown();
  const projectedData = getProjectedData();
  const cashFlowTrend = getCashFlowTrend();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
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
      const data = payload[0];
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p style={{ color: data.payload.color }} className="text-lg font-bold">
            ${data.value?.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            {data.payload.percentage?.toFixed(1)}% of income
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Enhanced Financial Breakdown */}
      <Card className="material-card col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="gradient-text text-2xl">Complete Financial Overview</CardTitle>
          <CardDescription>Your income allocation and spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage?.toFixed(0)}%`}
                  >
                    {financialBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {financialBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${item.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projected Financial Trends */}
      <Card className="material-card col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="gradient-text text-2xl">6-Month Financial Projection</CardTitle>
          <CardDescription>Historical data with future projections based on trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke={COLORS.income}
                  fill={COLORS.income}
                  fillOpacity={0.3}
                />
                <Bar dataKey="expenses" fill={COLORS.expense} />
                <Bar dataKey="subscriptions" fill={COLORS.subscription} />
                <Line type="monotone" dataKey="savings" stroke={COLORS.savings} strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Analysis */}
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text">Cash Flow Trend</CardTitle>
          <CardDescription>Your net cash flow over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="netCashFlow"
                  stroke={COLORS.projected}
                  fill={COLORS.projected}
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Impact Analysis */}
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text">Subscription Impact</CardTitle>
          <CardDescription>How subscriptions affect your monthly budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="expenses" fill={COLORS.expense} name="Other Expenses" />
                <Bar dataKey="subscriptions" fill={COLORS.subscription} name="Subscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetOverview;
