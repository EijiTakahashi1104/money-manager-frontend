import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

// ★ 各種アイコンをインポート
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import Dashboard from './pages/Dashboard';
import ExpensePage from './pages/ExpensePage';
import BudgetPage from './pages/BudgetPage';

export default function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* ナビゲーションバー */}
      <AppBar position="static">
        <Toolbar>
          {/* ロゴ部分（横にアイコンを追加してフレックス配置） */}
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <AccountBalanceWalletIcon sx={{ mr: 1 }} />
            Money Manager
          </Typography>

          {/* 各メニューボタンに startIcon を追加 */}
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

      {/* URLに応じて切り替わるメイン画面の領域 */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/budget" element={<BudgetPage />} />
        </Routes>
      </Container>
    </Box>
  );
}