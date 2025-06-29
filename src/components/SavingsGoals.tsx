
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Calendar, DollarSign, Trash2 } from "lucide-react";
import { SavingsGoal, Transaction } from '@/pages/Index';
import { useToast } from "@/hooks/use-toast";

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onUpdateGoals: (goals: SavingsGoal[]) => void;
  transactions: Transaction[];
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals, onUpdateGoals, transactions }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: ''
  });
  const { toast } = useToast();

  const savingsTransactions = transactions.filter(t => t.type === 'savings');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      return;
    }

    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      targetDate: formData.targetDate
    };

    onUpdateGoals([...goals, newGoal]);
    setFormData({ name: '', targetAmount: '', targetDate: '' });
    setShowForm(false);
    
    toast({
      title: "Savings Goal Added",
      description: `Goal "${newGoal.name}" has been created successfully.`,
    });
  };

  const handleDeleteGoal = (id: string) => {
    onUpdateGoals(goals.filter(goal => goal.id !== id));
    toast({
      title: "Goal Deleted",
      description: "Savings goal has been removed.",
    });
  };

  const calculateProgress = (goal: SavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalSavings = savingsTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Savings Overview */}
      <Card className="material-card">
        <CardHeader>
          <CardTitle className="gradient-text flex items-center gap-2">
            <Target className="h-5 w-5" />
            Savings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">${totalSavings.toLocaleString()}</p>
              <p className="text-sm text-blue-600">Total Saved</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{goals.length}</p>
              <p className="text-sm text-indigo-600">Active Goals</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {goals.filter(g => calculateProgress(g) >= 100).length}
              </p>
              <p className="text-sm text-purple-600">Completed Goals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Savings Goal
        </Button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const daysLeft = getDaysUntilTarget(goal.targetDate);
          const isCompleted = progress >= 100;
          const isOverdue = daysLeft < 0 && !isCompleted;

          return (
            <Card key={goal.id} className={`material-card ${isCompleted ? 'border-green-200 bg-green-50' : isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{goal.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {daysLeft > 0 ? `${daysLeft} days left` : 
                     daysLeft === 0 ? 'Due today' : 
                     `${Math.abs(daysLeft)} days overdue`}
                  </span>
                </div>
                
                <Progress value={progress} className="h-3" />
                
                <div className="flex justify-between text-sm">
                  <span className={`font-medium ${isCompleted ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                    {progress.toFixed(1)}% Complete
                  </span>
                  <span className="text-gray-500">
                    ${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining
                  </span>
                </div>

                {isCompleted && (
                  <div className="text-center p-2 bg-green-100 text-green-700 rounded-lg font-medium">
                    🎉 Goal Completed!
                  </div>
                )}

                {isOverdue && (
                  <div className="text-center p-2 bg-red-100 text-red-700 rounded-lg font-medium">
                    ⚠️ Goal Overdue
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card className="material-card">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No savings goals yet.</p>
            <p className="text-sm text-gray-400 mt-2">Create your first savings goal to start tracking your progress.</p>
          </CardContent>
        </Card>
      )}

      {/* Add Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md material-card animate-slide-up">
            <CardHeader>
              <CardTitle className="gradient-text">Add Savings Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goalName">Goal Name</Label>
                  <Input
                    id="goalName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount ($)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="10000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                    Create Goal
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
