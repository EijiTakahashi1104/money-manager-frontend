import { useState, useEffect } from 'react';
import { Paper, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import type { Category, Budget } from '../types';
import { API_BASE_URL } from '../config';

type Props = {
  categories: Category[];
  monthStr: string; // 例: "2026-08"
};

export default function BudgetSection({ categories, monthStr }: Props) {
  // カテゴリIDごとの入力金額を管理する状態 (例: { 1: 20000, 2: 25000 })
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});

// 選択中の月の予算一覧を取得
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/budgets/${monthStr}`)
      .then(res => {
        if (!res.ok) {
          // 404などのエラー時は空配列を返すか例外を投げる
          throw new Error('予算データが未登録、またはAPIが存在しません');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const map: { [key: number]: number } = {};
          data.forEach((b: Budget) => {
            map[b.categoryId] = b.budgetAmount;
          });
          setAmounts(map);
        }
      })
      .catch(err => {
        console.error('予算取得エラー:', err);
        // エラー時は何もしないか、初期化する
      });
  }, [monthStr]);

  // 入力値変更時の処理
  const handleChange = (categoryId: number, value: string) => {
    setAmounts({ ...amounts, [categoryId]: Number(value) });
  };

  // 予算の保存処理
  const handleSave = (categoryId: number) => {
    const budgetAmount = amounts[categoryId] || 0;
    const payload = {
      categoryId,
      yearMonth: monthStr,
      budgetAmount,
    };

    fetch(`${API_BASE_URL}/api/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('予算の保存に失敗しました');
        alert('予算を保存しました！');
      })
      .catch(err => console.error('保存エラー:', err));
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>{monthStr} のカテゴリ別予算設定</Typography>
      <List>
        {categories.map(cat => (
          <ListItem key={cat.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ListItemText primary={cat.name} sx={{ flex: 1 }} />
            <TextField
              type="number"
              label="予算金額"
              size="small"
              value={amounts[cat.id] ?? ''}
              onChange={e => handleChange(cat.id, e.target.value)}
            />
            <Button variant="outlined" size="small" onClick={() => handleSave(cat.id)}>
              保存
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}