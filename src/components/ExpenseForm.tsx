import { useState } from 'react';
import { Paper, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { API_BASE_URL } from '../config';
import type { Category } from '../types';

type Props = {
  categories: Category[];
  onExpenseAdded: () => void; // 登録成功後に親へ通知（一覧の再取得など）
};

export default function ExpenseForm({ categories, onExpenseAdded }: Props) {
  // フォームの入力状態はこのコンポーネント内で完結して持つ
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [memo, setMemo] = useState('');

  const resetForm = () => {
    setTitle('');
    setCategoryId('');
    setAmount('');
    setMemo('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryId === '' || amount === '') return;

    const payload = {
      title,
      amount: Number(amount),
      categoryId: Number(categoryId),
      expenseDate,
      memo,
    };

    fetch(`${API_BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('登録に失敗しました');
        resetForm();
        onExpenseAdded(); // 親に通知して一覧を再取得してもらう
      })
      .catch(err => console.error('登録エラー:', err));
  };

  return (
    <Paper sx={{ p: 3, mb: 4, backgroundColor: '#fcfcfc' }} elevation={2}>
      <Typography variant="h6" gutterBottom>新しい支出を登録</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          type="date"
          size="small"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />
        <TextField
          label="支出名"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <FormControl size="small" required sx={{ minWidth: 120 }}>
          <InputLabel id="category-select-label">カテゴリ</InputLabel>
          <Select
            labelId="category-select-label"
            value={categoryId === '' ? '' : String(categoryId)}
            label="カテゴリ"
            onChange={(e: SelectChangeEvent) => setCategoryId(Number(e.target.value))}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="number"
          label="金額 (円)"
          size="small"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || '')}
          required
        />
        <TextField
          label="メモ"
          size="small"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ height: '40px' }}>登録</Button>
      </Box>
    </Paper>
  );
}
