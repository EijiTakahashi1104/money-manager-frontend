import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import type { Expense, Category } from '../types';

type Props = {
  expenses: Expense[];
  categories: Category[];
};

export default function ExpenseList({ expenses, categories }: Props) {
  // 支出が0件の場合の表示
  if (expenses.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="textSecondary">今月の支出はまだありません。</Typography>
      </Box>
    );
  }

  // 日付の新しい順（降順）に並び替える
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
  );

  return (
    // 枠線をうっすら付けるために variant="outlined" を設定
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Table sx={{ minWidth: 600 }} aria-label="支出一覧テーブル">
        {/* 表のヘッダー部分 */}
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell width="15%"><strong>日付</strong></TableCell>
            <TableCell width="20%"><strong>カテゴリ</strong></TableCell>
            <TableCell width="30%"><strong>内容</strong></TableCell>
            <TableCell width="15%" align="right"><strong>金額</strong></TableCell>
            <TableCell width="20%"><strong>メモ</strong></TableCell>
          </TableRow>
        </TableHead>
        
        {/* 表のデータ部分 */}
        <TableBody>
          {sortedExpenses.map((expense) => {
            // カテゴリIDからカテゴリ名を検索
            const category = categories.find(c => c.id === expense.categoryId);
            
            return (
              <TableRow 
                key={expense.id} 
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#fafafa' } }}
              >
                <TableCell>{expense.expenseDate}</TableCell>
                <TableCell>{category ? category.name : '不明'}</TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell align="right">¥{expense.amount.toLocaleString()}</TableCell>
                <TableCell>{expense.memo || '-'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}