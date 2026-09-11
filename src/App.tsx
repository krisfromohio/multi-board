import { useMemo, useState } from 'react';
import {
  Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, Menu, MenuItem, Select,
  Stack, Tab, Tabs, TextField, Toolbar, Tooltip, Typography,
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { columns, demoItems, teamMembers, type BoardColumnId, type DemoWorkItem, type SourceSystem } from './demoData';

const sourceLabels: Record<SourceSystem, string> = { JIRA: 'Jira', SERVICENOW: 'ServiceNow', NOVA: 'Epic Nova' };
const assignableMembers = teamMembers.filter((m) => m !== 'All' && m !== 'Unassigned');

type SourceHealth = Record<SourceSystem, 'current' | 'stale'>;

function SourceChip({ source }: { source: SourceSystem }) {
  return <Chip size="small" variant="outlined" label={sourceLabels[source]} />;
}

function WorkCard({ item, backlog = false, onOpen, draggable = false, onDragStart }: {
  item: DemoWorkItem; backlog?: boolean; onOpen: () => void; draggable?: boolean; onDragStart?: () => void;
}) {
  return (
    <Card draggable={draggable} onDragStart={onDragStart} onClick={onOpen} sx={{ mb: 1.5, cursor: 'pointer', transition: 'transform 120ms ease, box-shadow 120ms ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(24,32,51,.10)' } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          {backlog && <Tooltip title="Drag to reprioritize"><DragIndicatorRoundedIcon color="disabled" sx={{ mt: 0.25, cursor: 'grab' }} /></Tooltip>}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <SourceChip source={item.sourceSystem} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{item.sourceId}</Typography>
              <OpenInNewRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            </Stack>
            <Typography variant="subtitle2" sx={{ fontSize: 15, fontWeight: 750, lineHeight: 1.35, mb: 1.2 }}>{item.name}</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
              <Chip size="small" label={item.storyPoints === null ? 'Unestimated' : `${item.storyPoints} pts`} sx={{ bgcolor: '#eef2fb' }} />
              {item.teamAssignee ? <Chip size="small" avatar={<Avatar>{item.teamAssignee[0]}</Avatar>} label={item.teamAssignee} /> : <Chip size="small" label="Unassigned" variant="outlined" />}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ItemDialog({ item, onClose, onSave }: { item: DemoWorkItem | null; onClose: () => void; onSave: (item: DemoWorkItem) => void }) {
  const [points, setPoints] = useState(item?.storyPoints?.toString() ?? '');
  const [sprint, setSprint] = useState(item?.sprint ?? '');
  const [member, setMember] = useState(item?.teamAssignee ?? '');
  if (!item) return null;
  const parsed = points === '' ? null : Number(points);
  const validPoints = parsed === null || (Number.isInteger(parsed) && parsed >= 0);
  const save = () => {
    if (!validPoints) return;
    const sprintChanged = (sprint || null) !== item.sprint;
    onSave({ ...item, storyPoints: parsed, sprint: sprint || null, teamAssignee: member || null, boardColumn: sprint ? (sprintChanged || !item.boardColumn ? 'BACKLOG' : item.boardColumn) : null });
  };
  return (
    <Dialog open maxWidth="sm" fullWidth onClose={onClose}>
      <DialogTitle>{item.name}</DialogTitle>
      <DialogContent>
        <Typography variant="overline" color="text.secondary">Source-owned</Typography>
        <Box sx={{ border: '1px solid #e1e5ec', borderRadius: 2, p: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><SourceChip source={item.sourceSystem} /><Typography fontWeight={700}>{item.sourceId}</Typography></Stack>
          <Typography variant="body2" sx={{ mb: 1 }}>{item.description}</Typography>
          <Typography variant="body2" color="text.secondary">Source assignee: {item.sourceAssignee}</Typography>
          <Button size="small" endIcon={<OpenInNewRoundedIcon />} href={item.sourceUrl} target="_blank" sx={{ mt: 1 }}>Open source record</Button>
        </Box>
        <Typography variant="overline" color="text.secondary">Multi Board-owned Scrum state</Typography>
        <Stack spacing={2} sx={{ mt: .5 }}>
          <TextField label="Story points" value={points} onChange={(e) => setPoints(e.target.value)} error={!validPoints} helperText={!validPoints ? 'Use a non-negative whole number or leave blank.' : 'Blank means unestimated; 0 is valid.'} />
          <FormControl><InputLabel>Sprint</InputLabel><Select label="Sprint" value={sprint} onChange={(e) => setSprint(e.target.value)}><MenuItem value="">No sprint</MenuItem><MenuItem value="Sprint 19">Sprint 19 · Current</MenuItem></Select></FormControl>
          <FormControl><InputLabel>Team assignee</InputLabel><Select label="Team assignee" value={member} onChange={(e) => setMember(e.target.value)}><MenuItem value="">Unassigned</MenuItem>{assignableMembers.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl>
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Cancel</Button><Button variant="contained" disabled={!validPoints} onClick={save}>Save</Button></DialogActions>
    </Dialog>
  );
}

export function App() {
  const [items, setItems] = useState(() => demoItems.map((i) => ({ ...i })));
  const [tab, setTab] = useState(1);
  const [assignee, setAssignee] = useState('All');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [health, setHealth] = useState<SourceHealth>({ JIRA: 'current', SERVICENOW: 'current', NOVA: 'current' });
  const [showStatus, setShowStatus] = useState(false);
  const [orphaned, setOrphaned] = useState(false);
  const selected = items.find((i) => i.key === selectedKey) ?? null;
  const sprintCount = useMemo(() => items.filter((i) => i.sprint === 'Sprint 19').length, [items]);
  const closeMenu = () => setMenuAnchor(null);

  const saveItem = (changed: DemoWorkItem) => { setItems((all) => all.map((i) => i.key === changed.key ? changed : i)); setSelectedKey(null); };
  const moveBoard = (column: BoardColumnId) => { if (!dragKey) return; setItems((all) => all.map((i) => i.key === dragKey ? { ...i, boardColumn: column } : i)); setDragKey(null); };
  const reorder = (targetKey: string) => {
    if (!dragKey || dragKey === targetKey) return;
    setItems((all) => { const next = [...all]; const from = next.findIndex((i) => i.key === dragKey); const to = next.findIndex((i) => i.key === targetKey); const [moved] = next.splice(from, 1); next.splice(to, 0, moved); return next; }); setDragKey(null);
  };
  const simulateRefresh = () => { setHealth({ JIRA: 'current', SERVICENOW: 'stale', NOVA: 'current' }); closeMenu(); };

  const sprintItems = items.filter((i) => i.sprint === 'Sprint 19');
  const filtered = sprintItems.filter((i) => assignee === 'All' || (assignee === 'Unassigned' ? !i.teamAssignee : i.teamAssignee === assignee));

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: '1px solid #e2e6ee', bgcolor: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)' }}><Toolbar sx={{ minHeight: 66 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 900, mr: 1.5 }}>M</Box>
        <Box sx={{ flexGrow: 1 }}><Typography variant="subtitle1" sx={{ fontWeight: 850, lineHeight: 1.1 }}>Multi Board</Typography><Typography variant="caption" color="text.secondary">Federated Scrum workspace</Typography></Box>
        <Chip size="small" label="POC · Local" variant="outlined" />
      </Toolbar></AppBar>

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Typography variant="h4">Clinical Apps Team</Typography>
          <Tooltip title="Workspace menu"><IconButton aria-label="Open workspace menu" onClick={(e) => setMenuAnchor(e.currentTarget)}><MenuRoundedIcon /></IconButton></Tooltip>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
            <MenuItem onClick={simulateRefresh}><RefreshRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />Refresh sources</MenuItem>
            <MenuItem onClick={() => { setShowStatus(true); closeMenu(); }}><StorageRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />Source status</MenuItem>
            <Divider />
            <MenuItem onClick={() => { setOrphaned((v) => !v); closeMenu(); }}><WarningAmberRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />{orphaned ? 'Hide' : 'Show'} orphaned-state example</MenuItem>
          </Menu>
        </Stack>

        {Object.values(health).includes('stale') && <Alert severity="warning" sx={{ mb: 2 }}>ServiceNow refresh failed. Showing last-known-good ServiceNow work from 9:31 AM. Jira and Epic Nova refreshed successfully. <Button size="small" onClick={() => setShowStatus(true)}>View source status</Button></Alert>}
        {orphaned && <Alert severity="error" icon={<WarningAmberRoundedIcon />} sx={{ mb: 2 }}>Configuration needs attention: <strong>NOVA:NOVA-731</strong> references team member “Maya (legacy)” which is no longer in the active team configuration. The value was preserved and was not silently reassigned.</Alert>}

        <Card sx={{ mb: 2.5 }}>
          <Box sx={{ px: 2.5, pt: 1 }}><Tabs value={tab} onChange={(_, v) => setTab(v)}><Tab label={`Backlog (${items.length})`} /><Tab label={`Sprint board (${sprintCount})`} /></Tabs></Box>
          <Divider />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }} alignItems={{ sm: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Sprint</InputLabel><Select label="Sprint" value="Sprint 19"><MenuItem value="Sprint 19">Sprint 19 · Current</MenuItem></Select></FormControl>
            {tab === 1 && <Stack direction="row" spacing={.75} useFlexGap flexWrap="wrap">{teamMembers.map((m) => <Chip key={m} clickable label={m} color={assignee === m ? 'primary' : 'default'} variant={assignee === m ? 'filled' : 'outlined'} onClick={() => setAssignee(m)} />)}</Stack>}
            <Box sx={{ flexGrow: 1 }} /><Typography variant="caption" color="text.secondary">Synthetic design-validation data</Typography>
          </Stack>
        </Card>

        {tab === 0 ? (
          <Stack spacing={1.2}>{items.map((item, index) => <Box key={item.key} draggable onDragStart={() => setDragKey(item.key)} onDragOver={(e) => e.preventDefault()} onDrop={() => reorder(item.key)} sx={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 1.2, alignItems: 'center' }}><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 750, textAlign: 'center' }}>{index + 1}</Typography><WorkCard item={item} backlog onOpen={() => setSelectedKey(item.key)} /></Box>)}</Stack>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(245px, 1fr))', gap: 2, alignItems: 'start', overflowX: 'auto', pb: 2 }}>
            {columns.map((column) => { const colItems = filtered.filter((i) => i.boardColumn === column.id); return <Box key={column.id} onDragOver={(e) => e.preventDefault()} onDrop={() => moveBoard(column.id)} sx={{ minWidth: 245, bgcolor: '#eef1f6', borderRadius: 3, p: 1.5, minHeight: 430 }}><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: .5, mb: 1.5 }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{column.name}</Typography><Chip size="small" label={colItems.length} sx={{ height: 24, minWidth: 30 }} /></Stack>{colItems.map((item) => <WorkCard key={item.key} item={item} draggable onDragStart={() => setDragKey(item.key)} onOpen={() => setSelectedKey(item.key)} />)}{colItems.length === 0 && <Box sx={{ border: '1px dashed #c7ceda', borderRadius: 2, p: 2, textAlign: 'center', color: 'text.secondary' }}><Typography variant="caption">Drop work here</Typography></Box>}</Box>; })}
          </Box>
        )}
      </Container>

      <ItemDialog key={selectedKey} item={selected} onClose={() => setSelectedKey(null)} onSave={saveItem} />
      <Dialog open={showStatus} onClose={() => setShowStatus(false)} maxWidth="sm" fullWidth><DialogTitle>Source status</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ mt: 1 }}>{(['JIRA','SERVICENOW','NOVA'] as SourceSystem[]).map((s) => <Box key={s} sx={{ p: 2, border: '1px solid #e1e5ec', borderRadius: 2 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={750}>{sourceLabels[s]}</Typography><Chip size="small" color={health[s] === 'current' ? 'success' : 'warning'} label={health[s] === 'current' ? 'Current' : 'Last-known-good'} /></Stack>{health[s] === 'stale' && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Latest refresh failed. Previously accepted work remains available; no items were archived by the failed refresh.</Typography>}</Box>)}</Stack></DialogContent><DialogActions><Button onClick={() => setShowStatus(false)}>Close</Button></DialogActions></Dialog>
    </Box>
  );
}
