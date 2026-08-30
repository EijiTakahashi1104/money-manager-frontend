import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, TextField, FormControl,
  InputLabel, Select, MenuItem, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { API_BASE_URL } from '../config';
import type { Category } from '../types';

type Template = {
  id: string;
  title: string;
  amount: number;
  categoryId: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  monthStr: string; // 例: "2026-08"
  onComplete: () => void; // 登録完了時に一覧を更新するための関数
};

export default function FixedExpenseDialog({ open, onClose, categories, monthStr, onComplete }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number | ''>('');

  // 画面が開かれた時に、ブラウザの保存領域（localStorage）からテンプレートを読み込む
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem('fixedExpenseTemplates');
      if (saved) {
        try {
          setTemplates(JSON.parse(saved));
        } catch (e) {
          console.error('テンプレートの読み込みに失敗しました', e);
        }
      }
    }
  }, [open]);

  // テンプレートを保存する関数
  const saveTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('fixedExpenseTemplates', JSON.stringify(newTemplates));
  };

  // 新しいテンプレートを追加
  const handleAddTemplate = () => {
    if (!newTitle || !newAmount || newCategoryId === '') return;
    
    const newTemplate: Template = {
      id: Date.now().toString(), // 簡易的な一意のID
      title: newTitle,
      amount: Number(newAmount),
      categoryId: Number(newCategoryId)
    };
    
    saveTemplates([...templates, newTemplate]);
    setNewTitle('');
    setNewAmount('');
    setNewCategoryId('');
  };

  // テンプレートを削除
  const handleDeleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
  };

  // ★ 登録済みのテンプレートを、今月の支出として一括POSTする
  const handleBulkRegister = async () => {
    if (templates.length === 0) return;

    // 今月の1日を登録日とする (例: "2026-08-01")
    const expenseDate = `${monthStr}-01`;

    try {
      // 全てのテンプレートに対して順番にAPIを叩く
      await Promise.all(
        templates.map(t =>
          fetch(`${API_BASE_URL}/api/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: t.title,
              amount: t.amount,
              categoryId: t.categoryId,
              expenseDate: expenseDate,
              memo: '固定費の自動入力'
            })
          })
        )
      );
      
      alert('固定費を一括登録しました！');
      onComplete(); // 画面を更新
      onClose();    // ダイアログを閉じる
    } catch (err) {
      console.error('一括登録エラー:', err);
      alert('登録中にエラーが発生しました。');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" /> 固定費の自動入力
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          毎月発生する家賃やサブスクを登録しておくと、ボタン一つで今月分として一気に登録できます。
        </Typography>

        {/* テンプレート追加エリア */}
        <Box sx={{ display: 'flex', gap: 1, mt: 3, mb: 3, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={newCategoryId}
              label="カテゴリ"
              onChange={(e) => setNewCategoryId(Number(e.target.value))}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="内容" size="small" value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)} sx={{ flexGrow: 1 }}
          />
          <TextField
            label="金額" type="number" size="small" value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)} sx={{ width: 100 }}
          />
          <Button variant="outlined" onClick={handleAddTemplate}>追加</Button>
        </Box>

        {/* 登録済みテンプレート一覧 */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>登録済みの固定費</Typography>
        {templates.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            まだ登録されていません。
          </Typography>
        ) : (
          <List>
            {templates.map(t => {
              const catName = categories.find(c => c.id === t.categoryId)?.name || '不明';
              return (
                <ListItem
                  key={t.id}
                  secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => handleDeleteTemplate(t.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <ListItemText
                    primary={t.title}
                    secondary={`${catName} - ¥${t.amount.toLocaleString()}`}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">閉じる</Button>
        <Button 
          onClick={handleBulkRegister} 
          variant="contained" 
          color="primary"
          disabled={templates.length === 0}
        >
          {monthStr}分として一括登録
        </Button>
      </DialogActions>
    </Dialog>
  );
}