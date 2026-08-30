import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import FixedExpenseDialog from '../components/FixedExpenseDialog';
import { API_BASE_URL } from '../config';
import type { Expense, Category } from '../types';

type Props = { monthStr: string };

export default function ExpensePage({ monthStr }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [fixedExpenseDialogOpen, setFixedExpenseDialogOpen] = useState(false);

  // 絞り込み用の状態
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');

  // ★ 修正：バックエンドの検索APIを呼び出すように変更！
  const fetchExpenses = () => {
    const url = new URL(`${API_BASE_URL}/api/expenses/search`);
    url.searchParams.append('monthStr', monthStr);
    if (filterCategoryId !== '') url.searchParams.append('categoryId', filterCategoryId.toString());
    if (filterKeyword) url.searchParams.append('keyword', filterKeyword);

    fetch(url.toString())
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setExpenses(data);
      })
      .catch(err => console.error('支出取得エラー:', err));
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('カテゴリ取得エラー:', err));
  }, []);

  // 月、カテゴリ、キーワードが変わるたびにバックエンドへ検索リクエストを飛ばす
  useEffect(() => {
    fetchExpenses();
  }, [monthStr, filterCategoryId, filterKeyword]);

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

  // ★ 修正：バックエンドのCSV生成APIを直接呼び出す（ダウンロードさせる）
  const handleExportCSV = () => {
    const url = new URL(`${API_BASE_URL}/api/expenses/export`);
    url.searchParams.append('monthStr', monthStr);
    if (filterCategoryId !== '') url.searchParams.append('categoryId', filterCategoryId.toString());
    if (filterKeyword) url.searchParams.append('keyword', filterKeyword);
    
    // ブラウザにこのURLへアクセスさせることで直接ファイルダウンロードを開始
    window.location.href = url.toString();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        支出管理
      </Typography>

      <Box sx={{ mb: 4 }}>
        <ExpenseForm categories={categories} onExpenseAdded={fetchExpenses} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button 
            variant="outlined" color="primary" sx={{ bgcolor: 'white' }}
            onClick={() => setFixedExpenseDialogOpen(true)}
            startIcon={<AutoAwesomeIcon />}
          >
            固定費を自動入力
          </Button>
          <Button 
            variant="outlined" color="success" sx={{ bgcolor: 'white' }}
            onClick={handleExportCSV}
            startIcon={<DownloadIcon />}
            disabled={expenses.length === 0} // 表示データが無い時は無効化
          >
            CSVをダウンロード
          </Button>
        </Box>
      </Box>

      {/* 絞り込みフィルター領域 */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 'bold' }}>
          絞り込み:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>カテゴリ</InputLabel>
          <Select
            value={filterCategoryId}
            label="カテゴリ"
            onChange={(e) => {
              const raw = String(e.target.value);
              setFilterCategoryId(raw === '' ? '' : Number(raw));
            }}
          >
            <MenuItem value=""><em>すべて</em></MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="キーワード検索"
          size="small"
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            },
          }}
          sx={{ flexGrow: 1 }}
        />
      </Paper>

      {/* 支出一覧テーブル（そのまま expenses を渡すだけでOK） */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{monthStr} の支出一覧</Typography>
        <ExpenseList 
          expenses={expenses} 
          categories={categories} 
          onDelete={handleDelete} 
          onEdit={handleEditClick} 
        />
      </Paper>

      <FixedExpenseDialog 
        open={fixedExpenseDialogOpen} onClose={() => setFixedExpenseDialogOpen(false)}
        categories={categories} monthStr={monthStr} onComplete={fetchExpenses}
      />

      <Dialog open={editDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        {/* 編集ダイアログの中身（変更なし） */}
        <DialogTitle>支出の編集</DialogTitle>
        <DialogContent dividers>
          {editingExpense && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField
                label="日付" type="date" value={editingExpense.expenseDate}
                onChange={(e) => setEditingExpense({ ...editingExpense, expenseDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <FormControl>
                <InputLabel>カテゴリ</InputLabel>
                <Select
                  value={editingExpense.categoryId} label="カテゴリ"
                  onChange={(e) => setEditingExpense({ ...editingExpense, categoryId: Number(e.target.value) })}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="内容" value={editingExpense.title}
                onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
              />
              <TextField
                label="金額" type="number" value={editingExpense.amount}
                onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
              />
              <TextField
                label="メモ" value={editingExpense.memo || ''}
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