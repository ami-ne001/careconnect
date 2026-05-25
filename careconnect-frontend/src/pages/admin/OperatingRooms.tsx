import { Box, Paper, Typography } from '@mui/material';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';

export function OperatingRooms() {
  return (
    <Box>
      <Typography variant="h5" className="!font-semibold !text-care-primary !mb-1">
        Operating rooms
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-6">
        Manage operating rooms and schedules (clinical-service).
      </Typography>

      <Paper
        elevation={0}
        className="rounded-xl border border-slate-200 p-12 flex flex-col items-center text-center max-w-lg mx-auto"
      >
        <Box className="flex gap-2 mb-4 text-care-accent">
          <MeetingRoomOutlinedIcon className="!text-5xl" />
          <ConstructionOutlinedIcon className="!text-5xl opacity-60" />
        </Box>
        <Typography variant="h6" className="!font-semibold !text-care-primary !mb-2">
          Coming soon
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Operating room data will be provided by clinical-service once that microservice is
          available. Check back in a later release.
        </Typography>
      </Paper>
    </Box>
  );
}
