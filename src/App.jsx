import React from 'react';
import { Icon } from './components/ui.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { LibraryScreen } from './screens/Library.jsx';
import { ProfileScreen, DetailPage } from './screens/Profile.jsx';
import { RecordScreen } from './screens/Record.jsx';
import { SearchScreen } from './screens/Search.jsx';

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

  const openDetail = (rec) => setDetail(rec);

  return (
    <div className="app">
      {tab === 'home'    && <HomeScreen onOpen={openDetail} onNotify={() => {}} onSearch={() => setSearching(true)} />}
      {tab === 'library' && <LibraryScreen onOpen={openDetail} onSearch={() => setSearching(true)} />}
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

      {detail && <DetailPage rec={detail} onClose={() => setDetail(null)} />}
      {searching && (
        <SearchScreen
          onClose={() => setSearching(false)}
          onOpen={(r) => { setSearching(false); openDetail(r); }}
        />
      )}
      {adding && <RecordScreen onClose={() => setAdding(false)} />}
    </div>
  );
}
