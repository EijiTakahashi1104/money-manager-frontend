import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Paper } from '@mui/material';
import ExpenseList from './components/ExpenseList';
import BudgetSection from './components/BudgetSection';
import { API_BASE_URL } from './config';

// データの型定義
export type Category = {
  id: number;
  name: string;
  defaultBudgetAmount: number;
};

export type Expense = {
  id?: number;
  title: string;
  amount: number;
  categoryId: number;
  expenseDate: string;
  memo?: string;
};

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // フォームの入力状態
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');

  // 現在の月（例: "2026-08"）
  const [monthStr] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // 初期データの取得
  useEffect(() => {
    fetchCategories();
    fetchExpensesByMonth(monthStr);
  }, [monthStr]);

  // カテゴリ一覧を取得
  const fetchCategories = () => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('カテゴリ通信エラー:', err));
  };

  // 支出一覧を取得（真っ白画面エラー対策済み）
  const fetchExpensesByMonth = (month: string) => {
    fetch(`${API_BASE_URL}/api/expenses/month/${month}`)
      .then(res => {
        if (!res.ok) throw new Error('サーバーエラーが発生しました');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setExpenses(data);
        } else {
          setExpenses([]);
        }
      })
      .catch(err => {
        console.error('通信エラー:', err);
        setExpenses([]);
      });
  };

  // 支出の登録処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData = { 
      title, 
      amount: Number(amount), 
      categoryId: Number(categoryId), 
      expenseDate, 
      memo 
    };

    fetch(`${API_BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    })
    .then(res => {
      if (!res.ok) throw new Error('登録に失敗しました');
      return res.json();
    })
    .then(() => {
      setTitle('');
      setAmount('');
      setCategoryId('');
      setMemo('');
      fetchExpensesByMonth(monthStr);
    })
    .catch(err => console.error('登録エラー:', err));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Money Manager</Typography>
      
      {/* カテゴリ別予算設定セクション */}
      <BudgetSection categories={categories} monthStr={monthStr} />

      {/* 登録フォーム */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>新しい支出を登録</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="日付" 
            type="date" 
            value={expenseDate} 
            onChange={e => setExpenseDate(e.target.value)} 
            required 
          />
          <TextField 
            label="支出名 (例: ランチ)" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
          <TextField 
            label="金額" 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            required 
          />
          <FormControl required>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={categoryId}
              label="カテゴリ"
              onChange={e => setCategoryId(e.target.value)}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="メモ (任意)" 
            value={memo} 
            onChange={e => setMemo(e.target.value)} 
          />
          <Button type="submit" variant="contained" color="primary" size="large">
            登録する
          </Button>
        </Box>
      </Paper>

      {/* 支出一覧 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{monthStr} の支出一覧</Typography>
        <ExpenseList expenses={expenses} categories={categories} />
      </Paper>
    </Container>
  );
}