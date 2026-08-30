import { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, LinearProgress } from '@mui/material'; // ★ LinearProgressを追加
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { API_BASE_URL } from '../config';
import type { Expense, Budget, Category } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

type Props = { monthStr: string };

export default function Dashboard({ monthStr }: Props) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('カテゴリ取得エラー:', err));

    fetch(`${API_BASE_URL}/api/budgets/${monthStr}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setBudgets(data); // ★ 取得した予算データを保存
          setTotalBudget(data.reduce((acc, curr: Budget) => acc + curr.budgetAmount, 0));
        }
      })
      .catch(err => console.error('予算取得エラー:', err));

    fetch(`${API_BASE_URL}/api/expenses/month/${monthStr}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setExpenses(data);
          setTotalExpense(data.reduce((acc, curr: Expense) => acc + curr.amount, 0));
        }
      })
      .catch(err => console.error('支出取得エラー:', err));
  }, [monthStr]);

  const remaining = totalBudget - totalExpense;

  // 円グラフ用のデータ
  const chartData = categories.map(cat => {
    const amount = expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat.name, value: amount };
  }).filter(data => data.value > 0);

  // ★ プログレスバー用のデータ整形（カテゴリごとの予算と支出を比較）
  const progressData = categories.map(cat => {
    const budget = budgets.find(b => b.categoryId === cat.id)?.budgetAmount || 0;
    const expense = expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
    // 消化率（予算が0の場合は、支出があれば強制的に100%オーバー扱いにする）
    const percentage = budget > 0 ? Math.min(Math.round((expense / budget) * 100), 100) : (expense > 0 ? 100 : 0);
    const isOver = expense > budget;

    return { name: cat.name, budget, expense, percentage, isOver };
  }).filter(data => data.budget > 0 || data.expense > 0); // 予算も支出も0のものは非表示

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        {monthStr} の状況
      </Typography>

      {/* サマリカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">今月の総予算</Typography>
              </Box>
              <Typography variant="h4">¥{totalBudget.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary">今月の総支出</Typography>
              </Box>
              <Typography variant="h4" color="error">¥{totalExpense.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SavingsIcon color={remaining < 0 ? "error" : "success"} sx={{ mr: 1 }} />
                <Typography color="textSecondary">今月の残額</Typography>
              </Box>
              <Typography variant="h4" color={remaining < 0 ? "error" : "primary"}>
                ¥{remaining.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* グラフとプログレスバーを横並び（スマホでは縦並び）にする */}
      <Grid container spacing={3}>
        {/* 左側：円グラフ */}
        {chartData.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" align="center" gutterBottom>
                カテゴリ別の支出割合
              </Typography>
              <Box sx={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `¥${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        )}

        {/* 右側：プログレスバー */}
        {progressData.length > 0 && (
          <Grid size={{ xs: 12, md: chartData.length > 0 ? 6 : 12 }}>
            <Card elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" align="center" gutterBottom>
                カテゴリ別の予算消化率
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {progressData.map((data, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{data.name}</Typography>
                      {/* 予算オーバー時は文字色を赤にする */}
                      <Typography variant="body2" color={data.isOver ? "error" : "textSecondary"}>
                        ¥{data.expense.toLocaleString()} / ¥{data.budget.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={data.percentage}
                          color={data.isOver ? "error" : "primary"}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">{`${data.percentage}%`}</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}