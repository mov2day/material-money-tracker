
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar } from "lucide-react";

export interface ScheduledIncomeItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  isActive: boolean;
}

interface ScheduledIncomeProps {
  scheduledIncomes: ScheduledIncomeItem[];
  onUpdateScheduledIncomes: (incomes: ScheduledIncomeItem[]) => void;
}

const INCOME_CATEGORIES = [
  'salary', 'freelance', 'investment', 'business', 'gift', 'other'
];

const ScheduledIncome: React.FC<ScheduledIncomeProps> = ({ scheduledIncomes, onUpdateScheduledIncomes }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    dayOfMonth: '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      return;
    }

    const newScheduledIncome: ScheduledIncomeItem = {
      id: Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      dayOfMonth: parseInt(formData.dayOfMonth),
      isActive: true
    };

    onUpdateScheduledIncomes([...scheduledIncomes, newScheduledIncome]);
    setFormData({ description: '', amount: '', category: '', dayOfMonth: '1' });
    setShowForm(false);
  };

  const toggleActive = (id: string) => {
    onUpdateScheduledIncomes(
      scheduledIncomes.map(income => 
        income.id === id ? { ...income, isActive: !income.isActive } : income
      )
    );
  };

  const deleteScheduledIncome = (id: string) => {
    onUpdateScheduledIncomes(scheduledIncomes.filter(income => income.id !== id));
  };

  const totalMonthlyIncome = scheduledIncomes
    .filter(income => income.isActive)
    .reduce((total, income) => total + income.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="material-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="gradient-text flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Income
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Total Monthly: <span className="font-semibold text-green-600">${totalMonthlyIncome.toLocaleString()}</span>
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Monthly Salary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {INCOME_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Select
                    value={formData.dayOfMonth}
                    onValueChange={(value) => setFormData({ ...formData, dayOfMonth: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto">
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add Scheduled Income
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {scheduledIncomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No scheduled income set up yet.</p>
              <p className="text-sm">Add recurring income to automatically track your monthly earnings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <Badge className={income.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {income.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{income.description}</p>
                      <p className="text-sm text-gray-500">
                        {income.category.charAt(0).toUpperCase() + income.category.slice(1)} • 
                        Day {income.dayOfMonth} of each month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-green-600">
                      ${income.amount.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(income.id)}
                      className={income.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {income.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteScheduledIncome(income.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledIncome;
