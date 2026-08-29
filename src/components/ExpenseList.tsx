import { List, ListItem, ListItemText, Typography, Divider } from '@mui/material';
import type { Expense, Category } from '../types';

type Props = {
  expenses: Expense[];
  categories: Category[];
};

export default function ExpenseList({ expenses, categories }: Props) {
  
  // ★ IDからカテゴリ名を引っ張ってくる便利関数
  const getCategoryName = (id: number) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : '不明なカテゴリ';
  };

  if (expenses.length === 0) {
    return <Typography color="text.secondary">支出データがありません。</Typography>;
  }

  return (
    <List>
      {expenses.map((expense, index) => (
        <div key={expense.id || index}>
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {expense.title} - ¥{expense.amount.toLocaleString()}
                </Typography>
              }
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {expense.expenseDate} | {getCategoryName(expense.categoryId)}
                  </Typography>
                  {expense.memo && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      - {expense.memo}
                    </Typography>
                  )}
                </>
              }
            />
          </ListItem>
          {index < expenses.length - 1 && <Divider />}
        </div>
      ))}
    </List>
  );
}