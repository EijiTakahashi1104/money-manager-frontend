import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Paper } from '@mui/material';

// アイコン
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// ページコンポーネント
import Dashboard from './pages/Dashboard';
import ExpensePage from './pages/ExpensePage';
import BudgetPage from './pages/BudgetPage';

export default function App() {
  // ★ アプリ全体で共有する「現在選択されている月」
  const [currentDate, setCurrentDate] = useState(new Date());

  // APIに渡すためのフォーマット (例: "2026-08")
  const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  // 画面表示用のフォーマット (例: "2026年8月")
  const displayMonth = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;

  // 前月へ
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 次月へ
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* ナビゲーションバー */}
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <AccountBalanceWalletIcon sx={{ mr: 1 }} />
            Money Manager
          </Typography>
          <Button color="inherit" component={Link} to="/" startIcon={<DashboardIcon />}>
            ダッシュボード
          </Button>
          <Button color="inherit" component={Link} to="/expenses" startIcon={<ReceiptIcon />}>
            支出管理
          </Button>
          <Button color="inherit" component={Link} to="/budget" startIcon={<AccountBalanceWalletIcon />}>
            予算設定
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        {/* ★ 月切り替えバーを追加 */}
        <Paper 
          elevation={1} 
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, mb: 4, borderRadius: 2 }}
        >
          <IconButton onClick={handlePrevMonth} color="primary">
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 4, fontWeight: 'bold' }}>
            {displayMonth}
          </Typography>
          <IconButton onClick={handleNextMonth} color="primary">
            <ArrowForwardIosIcon />
          </IconButton>
        </Paper>

        {/* 各ページに monthStr を Props として渡す */}
        <Routes>
          <Route path="/" element={<Dashboard monthStr={monthStr} />} />
          <Route path="/expenses" element={<ExpensePage monthStr={monthStr} />} />
          <Route path="/budget" element={<BudgetPage monthStr={monthStr} />} />
        </Routes>
      </Container>
    </Box>
  );
}