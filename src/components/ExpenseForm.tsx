import { Paper, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
// ★ハードコードされていた const CATEGORIES = [...] は削除！

// ★App.tsxと共有するための型を定義
export interface Category {
  id: number;
  name: string;
  defaultBudgetAmount: number | null;
}

interface Props {
  editId: number | null;
  expenseDate: string;
  title: string;
  categoryId: number | ''; // ★文字列(category)からID(categoryId)に変更
  categories: Category[];  // ★バックエンドから取得したカテゴリ一覧を受け取る
  amount: number | '';
  memo: string;
  onChangeDate: (val: string) => void;
  onChangeTitle: (val: string) => void;
  onChangeCategory: (val: number | '') => void; // ★IDを返すように変更
  onChangeAmount: (val: number | '') => void;
  onChangeMemo: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ExpenseForm(props: Props) {
  return (
    <Paper sx={{ p: 3, mb: 4, backgroundColor: '#fcfcfc' }} elevation={2}>
      <Typography variant="h6" gutterBottom>{props.editId ? '支出を編集' : '新しい支出を登録'}</Typography>
      <Box component="form" onSubmit={props.onSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField type="date" size="small" value={props.expenseDate} onChange={(e) => props.onChangeDate(e.target.value)} required />
        <TextField label="支出名" size="small" value={props.title} onChange={(e) => props.onChangeTitle(e.target.value)} required />
        
        {/* ★動的カテゴリのプルダウンに変更 */}
        <FormControl size="small" required sx={{ minWidth: 120 }}>
          <InputLabel id="category-select-label">カテゴリ</InputLabel>
          <Select 
            labelId="category-select-label" 
            value={props.categoryId === '' ? '' : String(props.categoryId)} 
            label="カテゴリ" 
            onChange={(e: SelectChangeEvent) => props.onChangeCategory(Number(e.target.value))}
          >
            {props.categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField type="number" label="金額 (円)" size="small" value={props.amount} onChange={(e) => props.onChangeAmount(Number(e.target.value) || '')} required />
        <TextField label="メモ" size="small" value={props.memo} onChange={(e) => props.onChangeMemo(e.target.value)} />
        <Button type="submit" variant="contained" color="primary" sx={{ height: '40px' }}>{props.editId ? '更新' : '登録'}</Button>
        {props.editId && <Button variant="outlined" color="secondary" sx={{ height: '40px' }} onClick={props.onCancel}>キャンセル</Button>}
      </Box>
    </Paper>
  );
}