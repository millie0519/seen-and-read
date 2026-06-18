import React from 'react';
import { Icon } from './components/ui.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { LibraryScreen } from './screens/Library.jsx';
import { ProfileScreen, DetailPage } from './screens/Profile.jsx';
import { RecordScreen } from './screens/Record.jsx';
import { SearchScreen } from './screens/Search.jsx';
import { migrateFromLocalStorage } from './db/migrate.js';

const TAB_DEF = [
  { id: 'home',    label: '홈',   icon: 'home' },
  { id: 'library', label: '책장', icon: 'grid' },
  { id: '__add',   label: '기록', icon: 'edit' },
  { id: 'profile', label: '마이', icon: 'user' },
];

export default function App() {
  const [tab, setTab]               = React.useState('home');
  const [detailLogId, setDetailLogId] = React.useState(null);  // 상세 열린 log ID
  const [editingRec, setEditingRec]   = React.useState(null);  // 수정 중인 RecordView
  const [replayRec, setReplayRec]     = React.useState(null);  // 회차 추가용 RecordView
  const [adding, setAdding]           = React.useState(false);
  const [searching, setSearching]     = React.useState(false);

  // 앱 첫 실행 시 localStorage → IndexedDB 마이그레이션
  React.useEffect(() => { migrateFromLocalStorage(); }, []);

  const openDetail = (logId) => setDetailLogId(logId);

  return (
    <div className="app">
      {tab === 'home'    && <HomeScreen    onOpen={openDetail} onSearch={() => setSearching(true)} />}
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

      {/* 상세 페이지 — logId만 전달, 화면 내부에서 직접 DB 조회 */}
      {detailLogId && (
        <DetailPage
          logId={detailLogId}
          onClose={() => setDetailLogId(null)}
          onDelete={() => setDetailLogId(null)}
          onEdit={(rec) => setEditingRec(rec)}
          onReplay={(rec) => { setDetailLogId(null); setReplayRec(rec); }}
        />
      )}

      {/* 검색 */}
      {searching && (
        <SearchScreen
          onClose={() => setSearching(false)}
          onOpen={(logId) => { setSearching(false); openDetail(logId); }}
        />
      )}

      {/* 새 기록 추가 */}
      {adding && (
        <RecordScreen
          onClose={() => setAdding(false)}
          onSaved={() => setAdding(false)}
        />
      )}

      {/* 기록 수정 — RecordView 전체를 전달 */}
      {editingRec && (
        <RecordScreen
          rec={editingRec}
          onClose={() => setEditingRec(null)}
          onSaved={() => setEditingRec(null)}
        />
      )}

      {/* 회차 추가 */}
      {replayRec && (
        <RecordScreen
          replayFor={replayRec}
          onClose={() => setReplayRec(null)}
          onSaved={() => setReplayRec(null)}
        />
      )}
    </div>
  );
}
