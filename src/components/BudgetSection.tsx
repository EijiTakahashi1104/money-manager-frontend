import { Paper, Box, Typography, TextField, Button } from '@mui/material';

interface Props {
  currentMonth: string;
  budgetAmount: number | null;
  budgetInput: number | '';
  totalAmount: number;
  onBudgetInputChange: (val: number | '') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BudgetSection({ currentMonth, budgetAmount, budgetInput, totalAmount, onBudgetInputChange, onSubmit }: Props) {
  return (
    <Paper sx={{ p: 3, mb: 4, backgroundColor: '#e3f2fd' }} elevation={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" gutterBottom>{currentMonth} の予算設定</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField type="number" label="予算額 (円)" size="small" value={budgetInput} onChange={(e) => onBudgetInputChange(Number(e.target.value) || '')} required />
            <Button type="submit" variant="contained" color="info" sx={{ height: '40px' }}>保存</Button>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" color="textSecondary">
            今月の支出合計: <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>{totalAmount.toLocaleString()} 円</Box>
          </Typography>
          {budgetAmount !== null && (
            <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
              残りの予算: <Box component="span" sx={{ color: budgetAmount - totalAmount < 0 ? 'error.main' : 'primary.main', fontWeight: 'bold' }}>
                {(budgetAmount - totalAmount).toLocaleString()} 円
              </Box>
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}