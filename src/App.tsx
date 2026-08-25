import { useEffect, useState, useMemo } from 'react';
import { Container, Typography } from '@mui/material';
import BudgetSection from './components/BudgetSection';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList, { type Expense } from './components/ExpenseList';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [memo, setMemo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const [currentMonth, setCurrentMonth] = useState('');
  const [budgetAmount, setBudgetAmount] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState<number | ''>('');

  const fetchExpensesByMonth = (monthStr: string) => {
    fetch(`http://35.74.235.240:8080/api/expenses/month/${monthStr}`)
      .then(res => res.json())
      .then(data => setExpenses(data))
      .catch(err => console.error('通信エラー:', err));
  };

  const fetchBudget = (monthStr: string) => {
    fetch(`http://35.74.235.240:8080/api/budgets/${monthStr}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Budget not found');
      })
      .then(data => {
        setBudgetAmount(data.budgetAmount);
        setBudgetInput(data.budgetAmount);
      })
      .catch(() => {
        setBudgetAmount(null);
        setBudgetInput('');
      });
  };

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const monthStr = `${yyyy}-${mm}`;
    setCurrentMonth(monthStr);
    fetchExpensesByMonth(monthStr);
    fetchBudget(monthStr);
  }, []);

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const resetForm = () => {
    setTitle(''); setAmount(''); setCategory(''); setExpenseDate(''); setMemo(''); setEditId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = { title, amount: Number(amount), category, expenseDate, memo };
    const url = editId ? `http://35.74.235.240:8080/api/expenses/${editId}` : 'http://35.74.235.240:8080/api/expenses';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    })
      .then(res => {
        if (res.ok) {
          fetchExpensesByMonth(currentMonth);
          resetForm();
        }
      })
      .catch(err => console.error('保存エラー:', err));
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetData = { yearMonth: currentMonth, budgetAmount: Number(budgetInput) };

    fetch('http://35.74.235.240:8080/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData),
    })
      .then(res => res.json())
      .then(data => {
        setBudgetAmount(data.budgetAmount);
        alert('予算を保存しました！');
      })
      .catch(err => console.error('予算保存エラー:', err));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('本当にこのデータを削除しますか？')) {
      fetch(`http://35.74.235.240:8080/api/expenses/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            fetchExpensesByMonth(currentMonth);
            if (editId === id) resetForm();
          }
        })
        .catch(err => console.error('削除エラー:', err));
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditId(expense.id!); setTitle(expense.title); setAmount(expense.amount);
    setCategory(expense.category); setExpenseDate(expense.expenseDate); setMemo(expense.memo || '');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }} color="primary">家計簿アプリ</Typography>
      
      <BudgetSection 
        currentMonth={currentMonth} budgetAmount={budgetAmount} budgetInput={budgetInput} 
        totalAmount={totalAmount} onBudgetInputChange={setBudgetInput} onSubmit={handleBudgetSubmit} 
      />
      
      <ExpenseForm 
        editId={editId} expenseDate={expenseDate} title={title} category={category} 
        amount={amount} memo={memo} onChangeDate={setExpenseDate} onChangeTitle={setTitle} 
        onChangeCategory={setCategory} onChangeAmount={setAmount} onChangeMemo={setMemo} 
        onSubmit={handleSubmit} onCancel={resetForm} 
      />
      
      <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
    </Container>
  );
}