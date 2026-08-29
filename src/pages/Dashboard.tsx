import { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { API_BASE_URL } from '../config';
import type { Expense, Budget } from '../types';

export default function Dashboard() {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // 現在の月（例: "2026-08"）
  const [monthStr] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    // 1. 今月の予算データを取得して合計を計算
    fetch(`${API_BASE_URL}/api/budgets/${monthStr}`)
      .then(res => {
        if (!res.ok) throw new Error('予算データが存在しません');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // reduceを使って配列内の budgetAmount をすべて足し合わせる
          const sum = data.reduce((acc, curr: Budget) => acc + curr.budgetAmount, 0);
          setTotalBudget(sum);
        }
      })
      .catch(err => console.error('予算取得エラー:', err));

    // 2. 今月の支出データを取得して合計を計算
    fetch(`${API_BASE_URL}/api/expenses/month/${monthStr}`)
      .then(res => {
        if (!res.ok) throw new Error('支出データが存在しません');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // reduceを使って配列内の amount をすべて足し合わせる
          const sum = data.reduce((acc, curr: Expense) => acc + curr.amount, 0);
          setTotalExpense(sum);
        }
      })
      .catch(err => console.error('支出取得エラー:', err));
  }, [monthStr]);

  // 残額の計算
  const remaining = totalBudget - totalExpense;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        {monthStr} の状況
      </Typography>

      {/* Gridを使ってカードを横並びに配置 */}
      <Grid container spacing={3}>
        {/* 1つ目のカード */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>今月の総予算</Typography>
              <Typography variant="h4">¥{totalBudget.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 2つ目のカード */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>今月の総支出</Typography>
              <Typography variant="h4" color="error">¥{totalExpense.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 3つ目のカード */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>今月の残額</Typography>
              {/* 残額がマイナスになったら赤色にする */}
              <Typography variant="h4" color={remaining < 0 ? "error" : "primary"}>
                ¥{remaining.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}