import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import BudgetSection from '../components/BudgetSection';
import { API_BASE_URL } from '../config';
import type { Category } from '../types';

export default function BudgetPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  
  // 現在の月（例: "2026-08"）
  const [monthStr] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    // カテゴリ一覧の取得
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('カテゴリ通信エラー:', err));
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        予算設定
      </Typography>
      
      {/* 予算設定コンポーネントの呼び出し */}
      <BudgetSection categories={categories} monthStr={monthStr} />
    </Box>
  );
}