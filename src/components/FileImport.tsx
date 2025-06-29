
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from '@/pages/Index';

interface FileImportProps {
  onImport: (transactions: Transaction[]) => void;
}

const FileImport: React.FC<FileImportProps> = ({ onImport }) => {
  const [showModal, setShowModal] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Automatic categorization logic
  const categorizeTransaction = (description: string, amount: number): { category: string; type: 'income' | 'expense' | 'savings' } => {
    const desc = description.toLowerCase();
    
    // Income patterns
    if (desc.includes('salary') || desc.includes('payroll') || desc.includes('deposit') || desc.includes('income')) {
      return { category: 'salary', type: 'income' };
    }
    
    // Savings patterns
    if (desc.includes('savings') || desc.includes('transfer to savings') || desc.includes('investment')) {
      return { category: 'emergency', type: 'savings' };
    }
    
    // Expense patterns
    if (desc.includes('grocery') || desc.includes('food') || desc.includes('restaurant') || desc.includes('cafe')) {
      return { category: 'food', type: 'expense' };
    }
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || desc.includes('taxi') || desc.includes('bus')) {
      return { category: 'transportation', type: 'expense' };
    }
    if (desc.includes('movie') || desc.includes('netflix') || desc.includes('spotify') || desc.includes('entertainment')) {
      return { category: 'entertainment', type: 'expense' };
    }
    if (desc.includes('electric') || desc.includes('water') || desc.includes('utility') || desc.includes('phone') || desc.includes('internet')) {
      return { category: 'utilities', type: 'expense' };
    }
    if (desc.includes('doctor') || desc.includes('pharmacy') || desc.includes('hospital') || desc.includes('medical')) {
      return { category: 'healthcare', type: 'expense' };
    }
    if (desc.includes('amazon') || desc.includes('walmart') || desc.includes('target') || desc.includes('shopping')) {
      return { category: 'shopping', type: 'expense' };
    }

    // Default to expense if amount is positive, income if negative (bank statement convention)
    return amount > 0 ? { category: 'other', type: 'expense' } : { category: 'other', type: 'income' };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      
      if (rows.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const dataRows = rows.slice(1);

      // Try to identify column mappings
      const dateCol = headers.findIndex(h => h.includes('date') || h.includes('transaction date'));
      const descCol = headers.findIndex(h => h.includes('description') || h.includes('memo') || h.includes('transaction'));
      const amountCol = headers.findIndex(h => h.includes('amount') || h.includes('debit') || h.includes('credit'));

      if (dateCol === -1 || descCol === -1 || amountCol === -1) {
        throw new Error('Could not identify required columns (date, description, amount)');
      }

      const parsed = dataRows.map((row, index) => {
        const columns = row.split(',').map(col => col.trim().replace(/"/g, ''));
        const date = columns[dateCol];
        const description = columns[descCol];
        const amount = parseFloat(columns[amountCol].replace(/[^-0-9.]/g, ''));

        if (isNaN(amount)) {
          console.warn(`Skipping row ${index + 2}: invalid amount`);
          return null;
        }

        const { category, type } = categorizeTransaction(description, amount);

        return {
          date: new Date(date).toISOString().split('T')[0],
          description,
          amount: Math.abs(amount),
          category,
          type,
          id: Date.now() + index
        };
      }).filter(Boolean);

      setParsedData(parsed);
      setShowModal(true);
      
      toast({
        title: "File Processed",
        description: `Successfully processed ${parsed.length} transactions with automatic categorization.`,
      });
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to process file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImport = () => {
    onImport(parsedData as Transaction[]);
    setShowModal(false);
    setParsedData([]);
  };

  return (
    <>
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-lg"
        size="lg"
        disabled={isProcessing}
      >
        <Upload className="mr-2 h-5 w-5" />
        {isProcessing ? 'Processing...' : 'Import Statement'}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden material-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="gradient-text flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Import Preview ({parsedData.length} transactions)
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto p-6">
                <div className="space-y-3">
                  {parsedData.slice(0, 10).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' :
                          transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{transaction.type}</p>
                      </div>
                    </div>
                  ))}
                  {parsedData.length > 10 && (
                    <p className="text-center text-gray-500 py-4">
                      ... and {parsedData.length - 10} more transactions
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 p-6 border-t">
                <Button onClick={handleImport} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                  Import All Transactions
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default FileImport;
