import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // ★追加
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import FixedExpenseDialog from '../components/FixedExpenseDialog'; // ★追加
import { API_BASE_URL } from '../config';
import type { Expense, Category } from '../types';

type Props = { monthStr: string };

export default function ExpensePage({ monthStr }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // 編集用・固定費用のダイアログ状態
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const [fixedExpenseDialogOpen, setFixedExpenseDialogOpen] = useState(false); // ★追加

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

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('カテゴリ取得エラー:', err));
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [monthStr]);

  const handleDelete = (id: number) => {
    if (!window.confirm('この支出を削除してもよろしいですか？')) return;
    fetch(`${API_BASE_URL}/api/expenses/${id}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('削除に失敗しました');
      fetchExpenses();
    })
    .catch(err => console.error('削除エラー:', err));
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditingExpense(null);
  };

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
      fetchExpenses();
    })
    .catch(err => console.error('更新エラー:', err));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        支出管理
      </Typography>

      {/* 登録フォームと固定費ボタン */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ExpenseForm categories={categories} onExpenseAdded={fetchExpenses} />
        
        {/* ★固定費自動入力ボタンを追加 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => setFixedExpenseDialogOpen(true)}
            startIcon={<AutoAwesomeIcon />}
            sx={{ bgcolor: 'white' }}
          >
            固定費を自動入力
          </Button>
        </Box>
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

      {/* ★固定費自動入力ダイアログ */}
      <FixedExpenseDialog 
        open={fixedExpenseDialogOpen} 
        onClose={() => setFixedExpenseDialogOpen(false)}
        categories={categories}
        monthStr={monthStr}
        onComplete={fetchExpenses}
      />

      {/* 編集用ダイアログ（修正いただいた slotProps 反映済み） */}
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
                slotProps={{ inputLabel: { shrink: true } }}
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