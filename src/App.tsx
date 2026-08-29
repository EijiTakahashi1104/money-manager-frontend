import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

// 先ほど作成したページコンポーネントをインポート
import Dashboard from './pages/Dashboard';
import ExpensePage from './pages/ExpensePage';
import BudgetPage from './pages/BudgetPage';

export default function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* ナビゲーションバー */}
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Money Manager
          </Typography>
          <Button color="inherit" component={Link} to="/">ダッシュボード</Button>
          <Button color="inherit" component={Link} to="/expenses">支出管理</Button>
          <Button color="inherit" component={Link} to="/budget">予算設定</Button>
        </Toolbar>
      </AppBar>

      {/* URLに応じて切り替わるメイン画面の領域 */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/budget" element={<BudgetPage />} />
        </Routes>
      </Container>
    </Box>
  );
}