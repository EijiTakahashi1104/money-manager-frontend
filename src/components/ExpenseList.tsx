import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, IconButton, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // ★ 編集アイコンを追加
import type { Expense, Category } from '../types';

type Props = {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: number) => void;
  onEdit: (expense: Expense) => void; // ★ 編集処理を受け取るプロパティを追加
};

export default function ExpenseList({ expenses, categories, onDelete, onEdit }: Props) {
  if (expenses.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="textSecondary">今月の支出はまだありません。</Typography>
      </Box>
    );
  }

  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
  );

  return (
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Table sx={{ minWidth: 600 }} aria-label="支出一覧テーブル">
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell width="15%"><strong>日付</strong></TableCell>
            <TableCell width="20%"><strong>カテゴリ</strong></TableCell>
            <TableCell width="30%"><strong>内容</strong></TableCell>
            <TableCell width="15%" align="right"><strong>金額</strong></TableCell>
            <TableCell width="10%"><strong>メモ</strong></TableCell>
            <TableCell width="10%" align="center"><strong>操作</strong></TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {sortedExpenses.map((expense) => {
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
                <TableCell align="center">
                  {/* ★ 編集ボタンを追加 */}
                  <Tooltip title="編集">
                    <IconButton 
                      color="primary" 
                      onClick={() => onEdit(expense)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {/* 削除ボタン */}
                  <Tooltip title="削除">
                    <IconButton 
                      color="error" 
                      onClick={() => expense.id && onDelete(expense.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}