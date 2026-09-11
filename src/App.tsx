import { useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { columns, demoItems, teamMembers, type DemoWorkItem, type SourceSystem } from './demoData';

const sourceLabels: Record<SourceSystem, string> = {
  JIRA: 'Jira',
  SERVICENOW: 'ServiceNow',
  NOVA: 'Epic Nova',
};

function SourceChip({ source }: { source: SourceSystem }) {
  return <Chip size="small" variant="outlined" label={sourceLabels[source]} />;
}

function WorkCard({ item, backlog = false }: { item: DemoWorkItem; backlog?: boolean }) {
  return (
    <Card sx={{ mb: 1.5, transition: 'transform 120ms ease, box-shadow 120ms ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(24,32,51,.10)' } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          {backlog && (
            <Tooltip title="Drag to reprioritize">
              <DragIndicatorRoundedIcon color="disabled" sx={{ mt: 0.25, cursor: 'grab' }} />
            </Tooltip>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <SourceChip source={item.sourceSystem} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {item.sourceId}
              </Typography>
              <OpenInNewRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            </Stack>
            <Typography variant="subtitle2" sx={{ fontSize: 15, fontWeight: 750, lineHeight: 1.35, mb: 1.2 }}>
              {item.name}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
              <Chip size="small" label={item.storyPoints === null ? 'Unestimated' : `${item.storyPoints} pts`} sx={{ bgcolor: '#eef2fb' }} />
              {item.teamAssignee ? (
                <Chip size="small" avatar={<Avatar>{item.teamAssignee[0]}</Avatar>} label={item.teamAssignee} />
              ) : (
                <Chip size="small" label="Unassigned" variant="outlined" />
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Board({ assignee }: { assignee: string }) {
  const sprintItems = demoItems.filter((item) => item.sprint === 'Sprint 19');
  const filtered = sprintItems.filter((item) => {
    if (assignee === 'All') return true;
    if (assignee === 'Unassigned') return item.teamAssignee === null;
    return item.teamAssignee === assignee;
  });

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(245px, 1fr))', gap: 2, alignItems: 'start', overflowX: 'auto', pb: 2 }}>
      {columns.map((column) => {
        const items = filtered.filter((item) => item.boardColumn === column.id);
        return (
          <Box key={column.id} sx={{ minWidth: 245, bgcolor: '#eef1f6', borderRadius: 3, p: 1.5, minHeight: 430 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5, mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{column.name}</Typography>
              <Chip size="small" label={items.length} sx={{ height: 24, minWidth: 30 }} />
            </Stack>
            {items.map((item) => <WorkCard key={item.key} item={item} />)}
            {items.length === 0 && (
              <Box sx={{ border: '1px dashed #c7ceda', borderRadius: 2, p: 2, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="caption">No work here</Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function Backlog() {
  return (
    <Stack spacing={1.2}>
      {demoItems.map((item, index) => (
        <Box key={item.key} sx={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 1.2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 750, textAlign: 'center' }}>{index + 1}</Typography>
          <WorkCard item={item} backlog />
        </Box>
      ))}
    </Stack>
  );
}

export function App() {
  const [tab, setTab] = useState(1);
  const [assignee, setAssignee] = useState('All');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const sprintCount = useMemo(() => demoItems.filter((item) => item.sprint === 'Sprint 19').length, []);

  const closeMenu = () => setMenuAnchor(null);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: '1px solid #e2e6ee', bgcolor: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)' }}>
        <Toolbar sx={{ minHeight: 66 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 900, mr: 1.5 }}>M</Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, lineHeight: 1.1 }}>Multi Board</Typography>
            <Typography variant="caption" color="text.secondary">Federated Scrum workspace</Typography>
          </Box>
          <Chip size="small" label="POC · Local" variant="outlined" />
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Typography variant="h4">Clinical Apps Team</Typography>
          <Tooltip title="Workspace menu">
            <IconButton
              aria-label="Open workspace menu"
              aria-controls={menuAnchor ? 'workspace-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuAnchor ? 'true' : undefined}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Tooltip>
          <Menu id="workspace-menu" anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
            <MenuItem onClick={closeMenu}>
              <RefreshRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />
              Refresh sources
            </MenuItem>
            <MenuItem onClick={closeMenu}>
              <StorageRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />
              Source status
            </MenuItem>
          </Menu>
        </Stack>

        <Card sx={{ mb: 2.5 }}>
          <Box sx={{ px: 2.5, pt: 1 }}>
            <Tabs value={tab} onChange={(_, value) => setTab(value)}>
              <Tab label={`Backlog (${demoItems.length})`} />
              <Tab label={`Sprint board (${sprintCount})`} />
            </Tabs>
          </Box>
          <Divider />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }} alignItems={{ sm: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sprint</InputLabel>
              <Select label="Sprint" value="Sprint 19">
                <MenuItem value="Sprint 19">Sprint 19 · Current</MenuItem>
              </Select>
            </FormControl>
            {tab === 1 && (
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {teamMembers.map((member) => (
                  <Chip key={member} clickable label={member} color={assignee === member ? 'primary' : 'default'} variant={assignee === member ? 'filled' : 'outlined'} onClick={() => setAssignee(member)} />
                ))}
              </Stack>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">Synthetic design-validation data</Typography>
          </Stack>
        </Card>

        {tab === 0 ? <Backlog /> : <Board assignee={assignee} />}
      </Container>
    </Box>
  );
}
