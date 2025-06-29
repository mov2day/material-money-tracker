
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, RefreshCw } from "lucide-react";

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  nextPayment: string;
  category: string;
  isActive: boolean;
}

interface SubscriptionTrackerProps {
  subscriptions: Subscription[];
  onUpdateSubscriptions: (subscriptions: Subscription[]) => void;
}

const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ 
  subscriptions, 
  onUpdateSubscriptions 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as const,
    nextPayment: '',
    category: 'entertainment'
  });

  const SUBSCRIPTION_CATEGORIES = [
    'entertainment', 'software', 'utilities', 'fitness', 'food', 'education', 'other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.nextPayment) {
      return;
    }

    const newSubscription: Subscription = {
      id: Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      nextPayment: formData.nextPayment,
      category: formData.category,
      isActive: true
    };

    onUpdateSubscriptions([...subscriptions, newSubscription]);
    setFormData({
      name: '',
      amount: '',
      frequency: 'monthly',
      nextPayment: '',
      category: 'entertainment'
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onUpdateSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const toggleActive = (id: string) => {
    onUpdateSubscriptions(
      subscriptions.map(sub => 
        sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
      )
    );
  };

  const calculateMonthlyTotal = () => {
    return subscriptions
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
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'bg-green-100 text-green-800';
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'quarterly':
        return 'bg-purple-100 text-purple-800';
      case 'yearly':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="material-card subscription-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="gradient-text flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Subscription Tracker
            </CardTitle>
            <div className="text-right">
              <p className="text-sm text-slate-600">Monthly Total</p>
              <p className="text-2xl font-bold text-orange-600">
                ${calculateMonthlyTotal().toFixed(2)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-600">
              {subscriptions.filter(sub => sub.isActive).length} active subscriptions
            </p>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6 border-2 border-orange-200">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sub-name">Service Name</Label>
                      <Input
                        id="sub-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Netflix, Spotify, etc."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-amount">Amount ($)</Label>
                      <Input
                        id="sub-amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="9.99"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-frequency">Frequency</Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-next">Next Payment</Label>
                      <Input
                        id="sub-next"
                        type="date"
                        value={formData.nextPayment}
                        onChange={(e) => setFormData({ ...formData, nextPayment: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sub-category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          {SUBSCRIPTION_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      Add Subscription
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No subscriptions added yet.</p>
                <p className="text-sm">Click "Add Subscription" to get started!</p>
              </div>
            ) : (
              subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    subscription.isActive 
                      ? 'bg-white border-slate-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{subscription.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Badge className={getFrequencyColor(subscription.frequency)}>
                          {subscription.frequency}
                        </Badge>
                        <span>•</span>
                        <span>{subscription.category}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(subscription.nextPayment).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-orange-600">
                      ${subscription.amount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(subscription.id)}
                      className={subscription.isActive ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {subscription.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(subscription.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionTracker;
