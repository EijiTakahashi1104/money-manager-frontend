import { useState, useEffect } from 'react';
import { Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Paper } from '@mui/material';
import ExpenseList from '../components/ExpenseList';
import { API_BASE_URL } from '../config';
import type { Category, Expense } from '../types';

type Props = { monthStr: string };

export default function ExpensePage({ monthStr }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // フォームの入力状態
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');

  useEffect(() => {
    // カテゴリの取得
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('カテゴリ通信エラー:', err));

    fetchExpensesByMonth(monthStr);
  }, [monthStr]);

  const fetchExpensesByMonth = (month: string) => {
    fetch(`${API_BASE_URL}/api/expenses/month/${month}`)
      .then(res => {
        if (!res.ok) throw new Error('サーバーエラーが発生しました');
        return res.json();
      })
      .then(data => {
        setExpenses(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('通信エラー:', err);
        setExpenses([]);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = { title, amount: Number(amount), categoryId: Number(categoryId), expenseDate, memo };

    fetch(`${API_BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    })
    .then(res => {
      if (!res.ok) throw new Error('登録に失敗しました');
      setTitle('');
      setAmount('');
      setCategoryId('');
      setMemo('');
      fetchExpensesByMonth(monthStr);
    })
    .catch(err => console.error('登録エラー:', err));
  };

  // ★ 追加：削除処理
  const handleDelete = (id: number) => {
    // 誤操作防止の確認ダイアログ
    if (!window.confirm('この支出を削除してもよろしいですか？')) return;

    fetch(`${API_BASE_URL}/api/expenses/${id}`, {
      method: 'DELETE',
    })
    .then(res => {
      if (!res.ok) throw new Error('削除に失敗しました');
      // 削除成功後、リストを再取得して画面を更新
      fetchExpensesByMonth(monthStr);
    })
    .catch(err => console.error('削除エラー:', err));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>支出の登録と管理</Typography>
      
      {/* 登録フォーム */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="日付" type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required />
          <TextField label="支出名 (例: ランチ)" value={title} onChange={e => setTitle(e.target.value)} required />
          <TextField label="金額" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
          <FormControl required>
            <InputLabel>カテゴリ</InputLabel>
            <Select value={categoryId} label="カテゴリ" onChange={e => setCategoryId(e.target.value)}>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="メモ (任意)" value={memo} onChange={e => setMemo(e.target.value)} />
          <Button type="submit" variant="contained" color="primary" size="large">
            登録する
          </Button>
        </Box>
      </Paper>

      {/* 支出一覧 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{monthStr} の支出一覧</Typography>
        {/* ★ onDelete={handleDelete} を追加 */}
        <ExpenseList expenses={expenses} categories={categories} onDelete={handleDelete} />
      </Paper>
    </Box>
  );
}