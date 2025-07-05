import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, TrendingUp, TrendingDown, Target, DollarSign, RefreshCw, BarChart3, PieChart, LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BudgetOverview from "@/components/BudgetOverview";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import ExpenseChart from "@/components/ExpenseChart";
import IncomeChart from "@/components/IncomeChart";
import SavingsGoals from "@/components/SavingsGoals";
import FileImport from "@/components/FileImport";
import SubscriptionTracker, { Subscription } from "@/components/SubscriptionTracker";

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const savedTransactions = localStorage.getItem('budget-transactions');
    const savedGoals = localStorage.getItem('savings-goals');
    const savedSubscriptions = localStorage.getItem('subscriptions');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedGoals) {
      setSavingsGoals(JSON.parse(savedGoals));
    }
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('budget-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('savings-goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowTransactionForm(false);
    toast({
      title: "Transaction Added",
      description: `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} of $${transaction.amount} added successfully.`,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Transaction Deleted",
      description: "Transaction has been removed from your budget.",
    });
  };

  const handleFileImport = (importedTransactions: Transaction[]) => {
    setTransactions(prev => [...importedTransactions, ...prev]);
    toast({
      title: "Import Successful",
      description: `${importedTransactions.length} transactions imported successfully.`,
    });
  };

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySubscriptions = subscriptions
      .filter(sub => sub.isActive)
      .reduce((total, sub) => {
        const multiplier = {
          weekly: 4.33,
          monthly: 1,
          quarterly: 0.33,
          yearly: 0.083
        }[sub.frequency];
        return total + (sub.amount * multiplier);
      }, 0);

    return { income, expenses, savings, balance: income - expenses, monthlySubscriptions };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-6 py-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Personal Budget Tracker
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Take control of your finances with intelligent insights and beautiful analytics
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              onClick={() => setShowTransactionForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg rounded-xl"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Transaction
            </Button>
            <FileImport onImport={handleFileImport} />
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">${totals.income.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">${totals.expenses.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-500 rounded-2xl shadow-lg">
                  <TrendingDown className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Savings</p>
                  <p className="text-3xl font-bold text-blue-600">${totals.savings.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                  <Target className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Subscriptions</p>
                  <p className="text-3xl font-bold text-orange-600">${totals.monthlySubscriptions.toFixed(0)}/mo</p>
                </div>
                <div className="p-4 bg-orange-500 rounded-2xl shadow-lg">
                  <RefreshCw className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${totals.balance >= 0 ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200/50' : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200/50'} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${totals.balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net Balance</p>
                  <p className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${totals.balance.toLocaleString()}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl shadow-lg ${totals.balance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-fit mx-auto bg-white backdrop-blur-sm border border-slate-200 shadow-lg rounded-2xl p-2">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger 
              value="subscriptions" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium"
            >
              Subscriptions
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium flex items-center gap-2"
            >
              <PieChart className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="income" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium flex items-center gap-2"
            >
              <LineChart className="h-4 w-4" />
              Income
            </TabsTrigger>
            <TabsTrigger 
              value="savings" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:text-slate-700 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium"
            >
              Savings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <BudgetOverview transactions={transactions} subscriptions={subscriptions} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-8">
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-8">
            <SubscriptionTracker 
              subscriptions={subscriptions}
              onUpdateSubscriptions={setSubscriptions}
            />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-8">
            <ExpenseChart transactions={transactions} />
          </TabsContent>

          <TabsContent value="income" className="space-y-8">
            <IncomeChart transactions={transactions} />
          </TabsContent>

          <TabsContent value="savings" className="space-y-8">
            <SavingsGoals 
              goals={savingsGoals} 
              onUpdateGoals={setSavingsGoals}
              transactions={transactions}
            />
          </TabsContent>
        </Tabs>

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <TransactionForm
            onSubmit={handleAddTransaction}
            onClose={() => setShowTransactionForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
