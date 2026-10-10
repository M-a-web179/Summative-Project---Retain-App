import { Alert, Box, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import StatCard from './StatCard';
import type { AdminInsights, CategorySpending } from '../types';
import { formatDate, formatMoney } from '../utils/format';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function CategoryList({ items, showTotal }: { items: CategorySpending[]; showTotal: boolean }) {
  if (items.length === 0) return <Typography color="text.secondary">No data yet.</Typography>;
  return (
    <List dense disablePadding>
      {items.map((item, index) => (
        <ListItem key={item.categoryId} disableGutters divider={index < items.length - 1}>
          <ListItemText
            primary={item.categoryName}
            secondary={showTotal ? undefined : `${item.count} expense(s)`}
          />
          <Typography variant="body2">{showTotal ? formatMoney(item.total) : `${item.count}`}</Typography>
        </ListItem>
      ))}
    </List>
  );
}

export default function InsightsPanel({ insights }: { insights: AdminInsights }) {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
        <StatCard label="Registered users" value={String(insights.totalUsers)} />
        <StatCard label="Expenses recorded" value={String(insights.totalExpenses)} />
        <StatCard label="Total value of expenses" value={formatMoney(insights.totalExpenseValue)} />
        <StatCard label="Recorded this month" value={String(insights.expensesThisMonth)} />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        <Section title="Spending per category">
          <CategoryList items={insights.spendingByCategory} showTotal />
        </Section>
        <Section title="Most-used categories">
          <CategoryList items={insights.mostUsedCategories} showTotal={false} />
        </Section>
        <Section title="Least-used categories">
          <CategoryList items={insights.leastUsedCategories} showTotal={false} />
        </Section>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Section title="Recently added expenses">
          {insights.recentExpenses.length === 0 ? (
            <Alert severity="info">No expenses recorded yet.</Alert>
          ) : (
            <List dense disablePadding>
              {insights.recentExpenses.map((expense, index) => (
                <Box key={expense.id}>
                  <ListItem disableGutters>
                    <ListItemText
                      primary={`${expense.title} · ${formatMoney(expense.amount)}`}
                      secondary={`${expense.userName} · ${expense.categoryName} · ${formatDate(expense.date)}`}
                    />
                  </ListItem>
                  {index < insights.recentExpenses.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          )}
        </Section>

        <Section title="Recently registered users">
          {insights.recentUsers.length === 0 ? (
            <Alert severity="info">No users yet.</Alert>
          ) : (
            <List dense disablePadding>
              {insights.recentUsers.map((person, index) => (
                <Box key={person.id}>
                  <ListItem disableGutters>
                    <ListItemText
                      primary={`${person.name} (${person.role})`}
                      secondary={`${person.email} · joined ${new Date(person.createdAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                  {index < insights.recentUsers.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          )}
        </Section>
      </Box>
    </Box>
  );
}