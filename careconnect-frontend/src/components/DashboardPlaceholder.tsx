import { Paper, Typography } from '@mui/material';

interface DashboardPlaceholderProps {
  title: string;
  description?: string;
}

export function DashboardPlaceholder({ title, description }: DashboardPlaceholderProps) {
  return (
    <Paper elevation={0} className="rounded-xl border border-slate-200 p-8">
      <Typography variant="h4" className="!font-semibold !text-care-primary mb-2">
        {title}
      </Typography>
      <Typography color="text.secondary">
        {description ??
          'Role dashboard placeholder — add pages under src/pages and register routes in src/routes.'}
      </Typography>
    </Paper>
  );
}
