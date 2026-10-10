import { TextField } from '@mui/material';

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
}

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <TextField
      label="Month"
      type="month"
      size="small"
      value={value}
      onChange={(e) => {
        if (e.target.value) onChange(e.target.value); 
      }}
      slotProps={{ inputLabel: { shrink: true } }}
    />
  );
}