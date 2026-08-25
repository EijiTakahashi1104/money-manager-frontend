import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// App.tsxと共有するため、Expenseの型を定義
export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  expenseDate: string;
  memo: string;
}

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f0f4f8' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>日付</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>支出名</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>カテゴリ</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>メモ</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>金額</TableCell>
            <TableCell align="center" sx={{ width: '120px' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} hover>
              <TableCell>{expense.expenseDate}</TableCell>
              <TableCell>{expense.title}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>{expense.memo}</TableCell>
              <TableCell align="right">{expense.amount.toLocaleString()} 円</TableCell>
              <TableCell align="center">
                <IconButton color="primary" onClick={() => onEdit(expense)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={() => onDelete(expense.id!)}><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}