import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import type { CategorySpending } from '../types';
import { formatMoney } from '../utils/format';

export default function CategoryBreakdown({ items }: { items: CategorySpending[] }) {
  const max = Math.max(...items.map((item) => item.total), 0);

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Spending by category
        </Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">No spending recorded this month.</Typography>
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {items.map((item) => (
              <Box key={item.categoryId}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="body2">
                    {item.categoryName} ({item.count})
                  </Typography>
                  <Typography variant="body2">{formatMoney(item.total)}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={max > 0 ? (item.total / max) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}