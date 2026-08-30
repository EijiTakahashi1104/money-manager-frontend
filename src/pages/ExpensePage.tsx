import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { API_BASE_URL } from '../config';
import type { Expense, Category } from '../types';

// App.tsx から選択中の月を受け取る
type Props = { monthStr: string };

export default function ExpensePage({ monthStr }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // 編集ダイアログ用の状態
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // 支出一覧を取得する関数（月が切り替わった時や、追加・編集・削除の後に呼ぶ）
  const fetchExpenses = () => {
    fetch(`${API_BASE_URL}/api/expenses/month/${monthStr}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setExpenses(data);
        }
      })
      .catch(err => console.error('支出取得エラー:', err));
  };

  // 初回のみカテゴリ一覧を取得
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('カテゴリ取得エラー:', err));
  }, []);

  // 対象月 (monthStr) が変わるたびに支出データを再取得
  useEffect(() => {
    fetchExpenses();
  }, [monthStr]);

  // ▼ 削除処理
  const handleDelete = (id: number) => {
    if (!window.confirm('この支出を削除してもよろしいですか？')) return;

    fetch(`${API_BASE_URL}/api/expenses/${id}`, {
      method: 'DELETE',
    })
    .then(res => {
      if (!res.ok) throw new Error('削除に失敗しました');
      // 成功したら一覧を再取得
      fetchExpenses();
    })
    .catch(err => console.error('削除エラー:', err));
  };

  // ▼ 編集ボタンが押された時の処理
  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setEditDialogOpen(true);
  };

  // ▼ 編集ダイアログを閉じる処理
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditingExpense(null);
  };

  // ▼ 編集内容を保存する処理（PUTリクエスト）
  const handleEditSubmit = () => {
    if (!editingExpense) return;

    fetch(`${API_BASE_URL}/api/expenses/${editingExpense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingExpense)
    })
    .then(res => {
      if (!res.ok) throw new Error('更新に失敗しました');
      handleCloseDialog();
      // 成功したら一覧を再取得
      fetchExpenses();
    })
    .catch(err => console.error('更新エラー:', err));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        支出管理
      </Typography>

      <Box sx={{ mb: 4 }}>
        {/* 新規登録フォーム（登録完了後に fetchExpenses を呼んで画面を更新） */}
        <ExpenseForm categories={categories} onExpenseAdded={fetchExpenses} />
      </Box>

      {/* 支出一覧テーブル */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{monthStr} の支出一覧</Typography>
        <ExpenseList 
          expenses={expenses} 
          categories={categories} 
          onDelete={handleDelete} 
          onEdit={handleEditClick} 
        />
      </Paper>

      {/* 編集用のポップアップ（ダイアログ） */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>支出の編集</DialogTitle>
        <DialogContent dividers>
          {editingExpense && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField
                label="日付"
                type="date"
                value={editingExpense.expenseDate}
                onChange={(e) => setEditingExpense({ ...editingExpense, expenseDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl>
                <InputLabel>カテゴリ</InputLabel>
                <Select
                  value={editingExpense.categoryId}
                  label="カテゴリ"
                  onChange={(e) => setEditingExpense({ ...editingExpense, categoryId: Number(e.target.value) })}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="内容"
                value={editingExpense.title}
                onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
              />
              <TextField
                label="金額"
                type="number"
                value={editingExpense.amount}
                onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
              />
              <TextField
                label="メモ"
                value={editingExpense.memo || ''}
                onChange={(e) => setEditingExpense({ ...editingExpense, memo: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">キャンセル</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">保存する</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}