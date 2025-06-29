
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, TrendingUp, TrendingDown, Target, DollarSign, RefreshCw } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold gradient-text">Personal Budget Tracker</h1>
          <p className="text-lg text-slate-600">Take control of your finances with intelligent insights</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="material-card hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">${totals.income.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="material-card hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">${totals.expenses.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="material-card hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Savings</p>
                  <p className="text-2xl font-bold text-blue-600">${totals.savings.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="material-card hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Subscriptions</p>
                  <p className="text-2xl font-bold text-orange-600">${totals.monthlySubscriptions.toFixed(0)}/mo</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <RefreshCw className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="material-card hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Net Balance</p>
                  <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totals.balance.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${totals.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <DollarSign className={`h-6 w-6 ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => setShowTransactionForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Transaction
          </Button>
          <FileImport onImport={handleFileImport} />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-fit mx-auto bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Transactions</TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Subscriptions</TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Expenses</TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Income</TabsTrigger>
            <TabsTrigger value="savings" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Savings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <BudgetOverview transactions={transactions} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionTracker 
              subscriptions={subscriptions}
              onUpdateSubscriptions={setSubscriptions}
            />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseChart transactions={transactions} />
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <IncomeChart transactions={transactions} />
          </TabsContent>

          <TabsContent value="savings" className="space-y-6">
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
