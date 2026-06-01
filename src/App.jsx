import React from 'react';
import { Icon } from './components/ui.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { LibraryScreen } from './screens/Library.jsx';
import { ProfileScreen, DetailPage } from './screens/Profile.jsx';
import { RecordScreen } from './screens/Record.jsx';
import { SearchScreen } from './screens/Search.jsx';
import { FEED } from './data.js';

const STORAGE_KEY = 'seen-and-read-records';

function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : FEED;
  } catch {
    return FEED;
  }
}

const TAB_DEF = [
  { id: 'home',    label: '홈',   icon: 'home' },
  { id: 'library', label: '책장', icon: 'grid' },
  { id: '__add',   label: '기록', icon: 'edit' },
  { id: 'profile', label: '마이', icon: 'user' },
];

export default function App() {
  const [tab, setTab] = React.useState('home');
  const [detail, setDetail] = React.useState(null);
  const [adding, setAdding] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [records, setRecords] = React.useState(loadRecords);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addRecord    = (rec) => setRecords(prev => [rec, ...prev]);
  const deleteRecord = (id)  => setRecords(prev => prev.filter(r => r.id !== id));
  const updateRecord = (id, patch) => setRecords(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const openDetail = (rec) => setDetail(rec);

  return (
    <div className="app">
      {tab === 'home'    && <HomeScreen records={records} onOpen={openDetail} onNotify={() => {}} onSearch={() => setSearching(true)} />}
      {tab === 'library' && <LibraryScreen records={records} onOpen={openDetail} onSearch={() => setSearching(true)} />}
      {tab === 'profile' && <ProfileScreen />}

      <nav className="bottomnav">
        {TAB_DEF.map((tb) =>
          tb.id === '__add' ? (
            <button key={tb.id} className="navitem" onClick={() => setAdding(true)}>
              <Icon name={tb.icon} size={24} />
              <span>{tb.label}</span>
            </button>
          ) : (
            <button
              key={tb.id}
              className={'navitem' + (tab === tb.id ? ' active' : '')}
              onClick={() => setTab(tb.id)}
            >
              <Icon name={tb.icon} size={24} />
              <span>{tb.label}</span>
            </button>
          )
        )}
      </nav>

      {detail && (
        <DetailPage
          rec={detail}
          onClose={() => setDetail(null)}
          onDelete={(id) => { deleteRecord(id); setDetail(null); }}
          onUpdate={(id, patch) => { updateRecord(id, patch); setDetail(prev => ({ ...prev, ...patch })); }}
        />
      )}
      {searching && (
        <SearchScreen
          records={records}
          onClose={() => setSearching(false)}
          onOpen={(r) => { setSearching(false); openDetail(r); }}
        />
      )}
      {adding && (
        <RecordScreen
          onClose={() => setAdding(false)}
          onSave={(rec) => { addRecord(rec); setAdding(false); }}
        />
      )}
    </div>
  );
}
