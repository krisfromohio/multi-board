import { useMemo, useRef, useState } from 'react';
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
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { columns, demoItems, type BoardColumnId, type DemoWorkItem, type SourceSystem } from './demoData';

const sourceLabels: Record<SourceSystem, string> = { JIRA: 'Jira', SERVICENOW: 'ServiceNow', NOVA: 'Epic Nova' };
const sourceStyles: Record<SourceSystem, { bgcolor: string; color: string; borderColor: string }> = {
  JIRA: { bgcolor: '#eef4ff', color: '#2456a6', borderColor: '#dbe8ff' },
  SERVICENOW: { bgcolor: '#eef8f4', color: '#23624d', borderColor: '#d8eee5' },
  NOVA: { bgcolor: '#f5efff', color: '#6c3aa1', borderColor: '#e8dcf8' },
};

type SourceHealth = Record<SourceSystem, 'current' | 'stale'>;
const PAGE_SIZE = 50;

function SourceChip({ source }: { source: SourceSystem }) {
  return <Chip size="small" variant="outlined" label={sourceLabels[source]} sx={{ ...sourceStyles[source], fontWeight: 750 }} />;
}

function displayId(item: DemoWorkItem) {
  return item.displayId ?? item.sourceId;
}

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function BoardCard({ item, onOpen, onDragStart }: { item: DemoWorkItem; onOpen: () => void; onDragStart: () => void }) {
  return (
    <Card draggable onDragStart={onDragStart} onClick={onOpen} sx={{ mb: 1.25, cursor: 'pointer', transition: 'transform 120ms ease, box-shadow 120ms ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(24,32,51,.10)' } }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={.75} alignItems="center" sx={{ mb: 1 }}>
          <SourceChip source={item.sourceSystem} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayId(item)}</Typography>
        </Stack>
        <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 750, lineHeight: 1.35, mb: 1.25, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</Typography>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
          <Chip size="small" label={item.storyPoints === null ? 'Unestimated' : `${item.storyPoints} pts`} sx={{ bgcolor: '#eef2fb' }} />
          <Stack direction="row" spacing={.6} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>{initials(item.teamAssignee)}</Avatar>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 125 }}>{item.teamAssignee ?? 'Unassigned'}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ItemDialog({ item, members, onClose, onSave }: { item: DemoWorkItem | null; members: string[]; onClose: () => void; onSave: (item: DemoWorkItem) => void }) {
  const [points, setPoints] = useState(item?.storyPoints?.toString() ?? '');
  const [sprint, setSprint] = useState(item?.sprint ?? '');
  const [member, setMember] = useState(item?.teamAssignee ?? '');
  const [column, setColumn] = useState<BoardColumnId | ''>(item?.boardColumn ?? '');
  if (!item) return null;
  const parsed = points === '' ? null : Number(points);
  const validPoints = parsed === null || (Number.isInteger(parsed) && parsed >= 0);
  const save = () => {
    if (!validPoints) return;
    const sprintChanged = (sprint || null) !== item.sprint;
    const nextColumn = sprint
      ? (sprintChanged || !column ? 'BACKLOG' : column)
      : null;
    onSave({ ...item, storyPoints: parsed, sprint: sprint || null, teamAssignee: member || null, boardColumn: nextColumn });
  };
  return (
    <Dialog open maxWidth="sm" fullWidth onClose={onClose}>
      <DialogTitle sx={{ pb: 1 }}>{item.name}</DialogTitle>
      <DialogContent>
        <Typography variant="overline" color="text.secondary">Source-owned</Typography>
        <Box sx={{ border: '1px solid #e1e5ec', borderRadius: 2, p: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
            <SourceChip source={item.sourceSystem} />
            <Typography fontWeight={750}>{displayId(item)}</Typography>
            {item.parentId && <Chip size="small" variant="outlined" label={`Parent ${item.parentId}`} />}
            {item.sourceState && <Chip size="small" variant="outlined" label={item.sourceState} />}
          </Stack>
          {item.description && <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>{item.description}</Typography>}
          <Typography variant="body2" color="text.secondary">Source assignee: {item.sourceAssignee ?? 'Unassigned'}</Typography>
          <Button size="small" endIcon={<OpenInNewRoundedIcon />} href={item.sourceUrl} target="_blank" rel="noreferrer" sx={{ mt: 1 }}>Open source record</Button>
        </Box>
        <Typography variant="overline" color="text.secondary">Multi Board-owned Scrum state</Typography>
        <Stack spacing={2} sx={{ mt: .5 }}>
          <TextField label="Story points" value={points} onChange={(e) => setPoints(e.target.value)} error={!validPoints} helperText={!validPoints ? 'Use a non-negative whole number or leave blank.' : 'Blank means unestimated; 0 is valid.'} />
          <FormControl><InputLabel>Sprint</InputLabel><Select label="Sprint" value={sprint} onChange={(e) => { setSprint(e.target.value); if (!e.target.value) setColumn(''); }}><MenuItem value="">No sprint</MenuItem><MenuItem value="Sprint 19">Sprint 19 · Current</MenuItem></Select></FormControl>
          {sprint && <FormControl><InputLabel>Board column</InputLabel><Select label="Board column" value={column || 'BACKLOG'} onChange={(e) => setColumn(e.target.value as BoardColumnId)}>{columns.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl>}
          <FormControl><InputLabel>Team assignee</InputLabel><Select label="Team assignee" value={member} onChange={(e) => setMember(e.target.value)}><MenuItem value="">Unassigned</MenuItem>{members.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl>
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Cancel</Button><Button variant="contained" disabled={!validPoints} onClick={save}>Save</Button></DialogActions>
    </Dialog>
  );
}

export function App() {
  const [items, setItems] = useState(() => demoItems.map((i) => ({ ...i })));
  const [tab, setTab] = useState(0);
  const [assignee, setAssignee] = useState('All');
  const [sourceFilter, setSourceFilter] = useState<SourceSystem | 'All'>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [health, setHealth] = useState<SourceHealth>({ JIRA: 'current', SERVICENOW: 'current', NOVA: 'current' });
  const [showStatus, setShowStatus] = useState(false);
  const [orphaned, setOrphaned] = useState(false);
  const [fixtureLabel, setFixtureLabel] = useState('Synthetic design-validation data');
  const [fixtureError, setFixtureError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const selected = items.find((i) => i.key === selectedKey) ?? null;
  const members = useMemo(() => Array.from(new Set(items.map((i) => i.teamAssignee).filter((m): m is string => Boolean(m)))).sort((a, b) => a.localeCompare(b)), [items]);
  const backlogCount = useMemo(() => items.filter((i) => !i.sprint).length, [items]);
  const sprintCount = useMemo(() => items.filter((i) => i.sprint === 'Sprint 19').length, [items]);
  const closeMenu = () => setMenuAnchor(null);

  const matchesFilters = (item: DemoWorkItem) => {
    if (sourceFilter !== 'All' && item.sourceSystem !== sourceFilter) return false;
    if (assignee !== 'All' && (assignee === 'Unassigned' ? Boolean(item.teamAssignee) : item.teamAssignee !== assignee)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [item.name, item.sourceId, item.displayId, item.parentId, item.teamAssignee, item.sourceAssignee]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
  };

  const filteredBacklog = useMemo(() => items.filter((i) => !i.sprint && matchesFilters(i)), [items, assignee, sourceFilter, search]);
  const filteredSprint = useMemo(() => items.filter((i) => i.sprint === 'Sprint 19' && matchesFilters(i)), [items, assignee, sourceFilter, search]);
  const pageCount = Math.max(1, Math.ceil(filteredBacklog.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filteredBacklog.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const saveItem = (changed: DemoWorkItem) => { setItems((all) => all.map((i) => i.key === changed.key ? changed : i)); setSelectedKey(null); };
  const moveBoard = (column: BoardColumnId) => { if (!dragKey) return; setItems((all) => all.map((i) => i.key === dragKey ? { ...i, boardColumn: column } : i)); setDragKey(null); };
  const reorder = (targetKey: string) => {
    if (!dragKey || dragKey === targetKey) return;
    setItems((all) => {
      const next = [...all];
      const from = next.findIndex((i) => i.key === dragKey);
      const to = next.findIndex((i) => i.key === targetKey);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragKey(null);
  };
  const simulateRefresh = () => { setHealth({ JIRA: 'current', SERVICENOW: 'stale', NOVA: 'current' }); closeMenu(); };

  const loadFixture = async (file?: File) => {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text()) as { items?: DemoWorkItem[] } | DemoWorkItem[];
      const candidate = Array.isArray(raw) ? raw : raw.items;
      if (!Array.isArray(candidate) || candidate.length === 0) throw new Error('The fixture does not contain an items array.');
      const keys = new Set<string>();
      for (const item of candidate) {
        if (!item?.key || !item.sourceSystem || !item.sourceId || !item.sourceUrl || !item.name) throw new Error('One or more fixture items are missing required fields.');
        if (keys.has(item.key)) throw new Error(`Duplicate work-item key: ${item.key}`);
        keys.add(item.key);
      }
      setItems(candidate.map((i) => ({ ...i })));
      setFixtureLabel(`${file.name} · loaded locally`);
      setFixtureError(null);
      setPage(0);
      setAssignee('All');
      setSourceFilter('All');
      setSearch('');
    } catch (error) {
      setFixtureError(error instanceof Error ? error.message : 'Could not load the fixture.');
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => void loadFixture(e.target.files?.[0])} />
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: '1px solid #e2e6ee', bgcolor: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)' }}><Toolbar sx={{ minHeight: 66 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 900, mr: 1.5 }}>M</Box>
        <Box sx={{ flexGrow: 1 }}><Typography variant="subtitle1" sx={{ fontWeight: 850, lineHeight: 1.1 }}>Multi Board</Typography><Typography variant="caption" color="text.secondary">Federated Scrum workspace</Typography></Box>
        <Chip size="small" label="POC · Local" variant="outlined" />
      </Toolbar></AppBar>

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Box><Typography variant="h4">Clinical Apps Team</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .4 }}>{fixtureLabel}</Typography></Box>
          <Tooltip title="Workspace menu"><IconButton aria-label="Open workspace menu" onClick={(e) => setMenuAnchor(e.currentTarget)}><MenuRoundedIcon /></IconButton></Tooltip>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
            <MenuItem onClick={() => { fileInput.current?.click(); closeMenu(); }}><UploadFileRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />Load local design data</MenuItem>
            <MenuItem onClick={simulateRefresh}><RefreshRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />Refresh sources</MenuItem>
            <MenuItem onClick={() => { setShowStatus(true); closeMenu(); }}><StorageRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />Source status</MenuItem>
            <Divider />
            <MenuItem onClick={() => { setOrphaned((v) => !v); closeMenu(); }}><WarningAmberRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />{orphaned ? 'Hide' : 'Show'} orphaned-state example</MenuItem>
          </Menu>
        </Stack>

        {fixtureError && <Alert severity="error" onClose={() => setFixtureError(null)} sx={{ mb: 2 }}>Could not load local design data: {fixtureError}</Alert>}
        {Object.values(health).includes('stale') && <Alert severity="warning" sx={{ mb: 2 }}>ServiceNow refresh failed. Showing last-known-good ServiceNow work from 9:31 AM. Jira and Epic Nova refreshed successfully. <Button size="small" onClick={() => setShowStatus(true)}>View source status</Button></Alert>}
        {orphaned && <Alert severity="error" icon={<WarningAmberRoundedIcon />} sx={{ mb: 2 }}>Configuration needs attention: a work item references a team member that is no longer in the active team configuration. The value was preserved and was not silently reassigned.</Alert>}

        <Card sx={{ mb: 2.5 }}>
          <Box sx={{ px: 2.5, pt: 1 }}><Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }}><Tab label={`Backlog (${backlogCount})`} /><Tab label={`Sprint 19 (${sprintCount})`} /></Tabs></Box>
          <Divider />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ p: 2 }} alignItems={{ md: 'center' }}>
            <TextField size="small" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search ID, title, parent, or person" InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} /> }} sx={{ minWidth: { xs: '100%', md: 320 } }} />
            <FormControl size="small" sx={{ minWidth: 155 }}><InputLabel>Source</InputLabel><Select label="Source" value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value as SourceSystem | 'All'); setPage(0); }}><MenuItem value="All">All sources</MenuItem><MenuItem value="JIRA">Jira</MenuItem><MenuItem value="SERVICENOW">ServiceNow</MenuItem><MenuItem value="NOVA">Epic Nova</MenuItem></Select></FormControl>
            <FormControl size="small" sx={{ minWidth: 210 }}><InputLabel>Team assignee</InputLabel><Select label="Team assignee" value={assignee} onChange={(e) => { setAssignee(e.target.value); setPage(0); }}><MenuItem value="All">All assignees</MenuItem><MenuItem value="Unassigned">Unassigned</MenuItem>{members.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">{tab === 0 ? `${filteredBacklog.length} matching backlog items` : `${filteredSprint.length} matching sprint items`}</Typography>
          </Stack>
        </Card>

        {tab === 0 ? (
          <Card sx={{ overflow: 'hidden' }}>
            <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '44px 125px 135px minmax(300px,1fr) 190px 140px 38px', gap: 1, px: 1.75, py: 1.1, bgcolor: '#f8fafc', borderBottom: '1px solid #e4e8f0' }}>
              {['#', 'Source', 'ID', 'Work item', 'Team assignee', 'Source state', ''].map((h) => <Typography key={h} variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</Typography>)}
            </Box>
            {pageItems.length === 0 ? <Box sx={{ py: 8, textAlign: 'center' }}><Typography color="text.secondary">No backlog work matches these filters.</Typography></Box> : pageItems.map((item, index) => (
              <Box key={item.key} draggable onDragStart={() => setDragKey(item.key)} onDragOver={(e) => e.preventDefault()} onDrop={() => reorder(item.key)} onClick={() => setSelectedKey(item.key)} sx={{ display: 'grid', gridTemplateColumns: { xs: '34px 105px minmax(0,1fr) 36px', md: '44px 125px 135px minmax(300px,1fr) 190px 140px 38px' }, gap: 1, px: 1.75, py: 1.15, alignItems: 'center', borderBottom: '1px solid #edf0f4', cursor: 'pointer', bgcolor: 'background.paper', '&:hover': { bgcolor: '#fafcff' } }}>
                <Tooltip title="Drag to reprioritize"><Box sx={{ display: 'flex', alignItems: 'center', gap: .25, color: 'text.secondary' }}><DragIndicatorRoundedIcon sx={{ fontSize: 17 }} /><Typography variant="caption" fontWeight={750}>{safePage * PAGE_SIZE + index + 1}</Typography></Box></Tooltip>
                <SourceChip source={item.sourceSystem} />
                <Typography variant="caption" color="text.secondary" fontWeight={750} noWrap sx={{ display: { xs: 'none', md: 'block' } }}>{displayId(item)}</Typography>
                <Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={750} noWrap>{item.name}</Typography>{item.parentId && <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' } }}>Parent {item.parentId}</Typography>}</Box>
                <Stack direction="row" spacing={.8} alignItems="center" sx={{ minWidth: 0, display: { xs: 'none', md: 'flex' } }}><Avatar sx={{ width: 25, height: 25, fontSize: 10 }}>{initials(item.teamAssignee)}</Avatar><Typography variant="caption" color="text.secondary" noWrap>{item.teamAssignee ?? 'Unassigned'}</Typography></Stack>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', md: 'block' } }}>{item.sourceState ?? '—'}</Typography>
                <Tooltip title="Open source record"><IconButton size="small" component="a" href={item.sourceUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label={`Open ${displayId(item)} in ${sourceLabels[item.sourceSystem]}`}><OpenInNewRoundedIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
              </Box>
            ))}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>
              <Typography variant="caption" color="text.secondary">Showing {filteredBacklog.length ? safePage * PAGE_SIZE + 1 : 0}–{Math.min((safePage + 1) * PAGE_SIZE, filteredBacklog.length)} of {filteredBacklog.length}</Typography>
              <Stack direction="row" spacing={1}><Button size="small" variant="outlined" disabled={safePage === 0} onClick={() => setPage(Math.max(0, safePage - 1))}>Previous</Button><Button size="small" variant="outlined" disabled={safePage >= pageCount - 1} onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}>Next</Button></Stack>
            </Stack>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))', gap: 2, alignItems: 'start', overflowX: 'auto', pb: 2 }}>
            {columns.map((column) => {
              const colItems = filteredSprint.filter((i) => i.boardColumn === column.id);
              return <Box key={column.id} onDragOver={(e) => e.preventDefault()} onDrop={() => moveBoard(column.id)} sx={{ minWidth: 260, bgcolor: '#eaf0f7', borderRadius: 3, p: 1.5, minHeight: 500 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: .5, mb: 1.5 }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{column.name}</Typography><Chip size="small" label={colItems.length} sx={{ height: 24, minWidth: 30, bgcolor: '#fff' }} /></Stack>
                {colItems.map((item) => <BoardCard key={item.key} item={item} onDragStart={() => setDragKey(item.key)} onOpen={() => setSelectedKey(item.key)} />)}
                {colItems.length === 0 && <Box sx={{ border: '1px dashed #c7ceda', borderRadius: 2, p: 2, textAlign: 'center', color: 'text.secondary' }}><Typography variant="caption">Drop work here</Typography></Box>}
              </Box>;
            })}
          </Box>
        )}
      </Container>

      <ItemDialog key={selectedKey} item={selected} members={members} onClose={() => setSelectedKey(null)} onSave={saveItem} />
      <Dialog open={showStatus} onClose={() => setShowStatus(false)} maxWidth="sm" fullWidth><DialogTitle>Source status</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ mt: 1 }}>{(['JIRA','SERVICENOW','NOVA'] as SourceSystem[]).map((s) => <Box key={s} sx={{ p: 2, border: '1px solid #e1e5ec', borderRadius: 2 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={750}>{sourceLabels[s]}</Typography><Chip size="small" color={health[s] === 'current' ? 'success' : 'warning'} label={health[s] === 'current' ? 'Current' : 'Last-known-good'} /></Stack>{health[s] === 'stale' && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Latest refresh failed. Previously accepted work remains available; no items were archived by the failed refresh.</Typography>}</Box>)}</Stack></DialogContent><DialogActions><Button onClick={() => setShowStatus(false)}>Close</Button></DialogActions></Dialog>
    </Box>
  );
}
