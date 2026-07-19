const SHIFT_CODES = ['H','S','S2','N','W','AS','O'];
const CODE_LABEL = {H:'H',S:'S',S2:'S2',N:'N',W:'W',AS:'AS',O:'휴무'};
const CRITICAL_SHIFTS = ['H','S','N','W']; // 최소 인원 유지 대상 (월~토 4명 필수)
const SHIFT_HEX = {H:'3B82F6', S:'10B981', S2:'0EA5E9', N:'8B5CF6', W:'F59E0B', AS:'F43F5E', O:'E2E8F0'};
const SHIFT_TEXT_HEX = {H:'FFFFFF', S:'FFFFFF', S2:'FFFFFF', N:'FFFFFF', W:'1E293B', AS:'FFFFFF', O:'1E293B'};

const HOLIDAYS_2026 = {
  '2026-01-01':'신정', '2026-02-16':'설날연휴', '2026-02-17':'설날', '2026-02-18':'설날연휴',
  '2026-03-01':'삼일절', '2026-03-02':'대체공휴일(삼일절)', '2026-05-01':'근로자의날', '2026-05-05':'어린이날',
  '2026-05-24':'부처님오신날', '2026-05-25':'대체공휴일(부처님오신날)', '2026-06-03':'지방선거(임시공휴일)',
  '2026-06-06':'현충일', '2026-07-17':'제헌절', '2026-08-15':'광복절', '2026-08-17':'대체공휴일(광복절)',
  '2026-09-24':'추석연휴', '2026-09-25':'추석', '2026-09-26':'추석연휴', '2026-10-03':'개천절',
  '2026-10-05':'대체공휴일(개천절)', '2026-10-09':'한글날', '2026-12-25':'크리스마스'
};

let EMP_NAMES = ['근무자1','근무자2','근무자3','근무자4','근무자5','근무자6'];
let fixedOff = [[],[],[],[],[],[]];
let targetOffDays = Array.from({length:6}, () => [4,4,4]); // 기본 4일
let DAYS = [];
let scheduleGrid = null;
let lastWarnings = [];
let periodLocked = [false, false, false];

function fmt(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
const DOW_KR = ['일','월','화','수','목','금','토'];

function buildDays(startISO, totalDays){
  const start = new Date(startISO+'T00:00:00');
  const arr = [];
  for(let i=0;i<totalDays;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    const dow = d.getDay();
    const isWeekend = (dow===0 || dow===6);
    const iso = fmt(d);
    arr.push({date:d, iso, dow, isWeekend, isHoliday: !!HOLIDAYS_2026[iso], label:`${d.getMonth()+1}/${d.getDate()}(${DOW_KR[dow]})`});
  }
  return arr;
}

function renderEmpNameGrid(){
  const g = document.getElementById('empNameGrid');
  g.innerHTML = '';
  for(let i=0;i<6;i++){
    const box = document.createElement('div');
    box.className='emp-box';
    box.innerHTML = `<div class="name">근무자 ${i+1}</div>
      <input type="text" value="${EMP_NAMES[i]}" data-idx="${i}" class="empNameInput">`;
    g.appendChild(box);
  }
  g.querySelectorAll('.empNameInput').forEach(inp=>{
    inp.addEventListener('input', e=>{
      EMP_NAMES[+e.target.dataset.idx] = e.target.value || `근무자${+e.target.dataset.idx+1}`;
      refreshIcsEmployeeSelect();
      if(scheduleGrid) renderScheduleTab();
    });
  });
  renderTargetOffTable();
  refreshIcsEmployeeSelect();
}

function refreshIcsEmployeeSelect(){
  const sel = document.getElementById('icsEmployeeSelect');
  if(!sel) return;
  const prevVal = sel.value;
  sel.innerHTML = EMP_NAMES.map((n,i)=>`<option value="${i}">${n}</option>`).join('');
  if(prevVal !== '' && +prevVal < EMP_NAMES.length) sel.value = prevVal;
}

function renderTargetOffTable(){
    const tbody = document.getElementById('targetOffBody');
    tbody.innerHTML = '';
    for(let i=0; i<6; i++){
        const row = document.createElement('tr');
        row.innerHTML = `<td>${EMP_NAMES[i]}</td>` +
            [0,1,2].map(k => `<td><input type="number" min="0" max="28" value="${targetOffDays[i][k]}" class="targetInput" data-emp="${i}" data-period="${k}" style="width:50px;"></td>`).join('');
        tbody.appendChild(row);
    }
    tbody.querySelectorAll('.targetInput').forEach(inp => {
        inp.addEventListener('change', e => {
            targetOffDays[+e.target.dataset.emp][+e.target.dataset.period] = +e.target.value;
        });
    });
}

function renderFixOffTab(){
  const g = document.getElementById('fixOffGrid');
  g.innerHTML = '';
  const startISO = document.getElementById('startDate').value;
  const days = buildDays(startISO, 84);
  const minD = days[0].iso, maxD = days[days.length-1].iso;
  for(let i=0;i<6;i++){
    const box = document.createElement('div');
    box.className='emp-box';
    let html = `<div class="name">${EMP_NAMES[i]}</div><div class="off-list">`;
    for(let k=0;k<3;k++){
      const val = fixedOff[i][k] || '';
      html += `<input type="date" min="${minD}" max="${maxD}" value="${val}" data-idx="${i}" data-k="${k}" class="fixOffInput">`;
    }
    html += `</div>`;
    box.innerHTML = html;
    g.appendChild(box);
  }
  g.querySelectorAll('.fixOffInput').forEach(inp=>{
    inp.addEventListener('input', e=>{
      fixedOff[+e.target.dataset.idx][+e.target.dataset.k] = e.target.value;
    });
  });
}

function refreshHolidayNote(){
  const startISO = document.getElementById('startDate').value;
  const days = buildDays(startISO, 84);
  const found = days.filter(d=>d.isHoliday);
  document.getElementById('holidayNote').textContent = found.length > 0 ? `이 기간 공휴일 (총 ${found.length}일): ${found.map(d=>d.label).join(', ')}` : '이 기간 공휴일: 없음 (총 0일).';
}
document.getElementById('startDate').addEventListener('change', () => {
    refreshHolidayNote();
    renderFixOffTab();
});

// 핵심 로직 - 제공된 근무패턴(엑셀)을 인원별 84일 그대로 사용 (가공 없음)
const EMP_PATTERN_84 = [
  ['S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','O','O','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','N','W','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O'],
  ['S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS'],
  ['N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','O','O','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','N','W'],
  ['O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','N','W','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','O','O'],
  ['W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N'],
  ['H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O']
];

function isSafeToOff(empIdx, dayIdx, currentGrid) {
    // 일요일(dow===0)은 최소인원 제한 없음. 월~토(dow 1~6)는 S,N,W,H 4명 이상 유지 필수.
    const dow = DAYS[dayIdx] ? DAYS[dayIdx].dow : null;
    if(dow === 0) return true;
    let criticalCount = 0;
    for(let i=0; i<6; i++) {
        if(i !== empIdx && CRITICAL_SHIFTS.includes(currentGrid[i][dayIdx])) criticalCount++;
    }
    return criticalCount >= 4;
}

function generateSchedule(){
  const startISO = document.getElementById('startDate').value;
  const prevGrid = scheduleGrid;
  const prevDays = DAYS;
  DAYS = buildDays(startISO, 84);

  // 잠금은 이전 스케줄과 시작일이 동일할 때만 유효 (날짜가 바뀌면 의미 없음)
  const lockUsable = !!(prevGrid && prevDays.length === DAYS.length && prevDays[0] && prevDays[0].iso === DAYS[0].iso);
  if(!lockUsable && periodLocked.some(v=>v)){
    periodLocked = [false, false, false];
    ['lockP0','lockP1','lockP2'].forEach(id=>{ const el = document.getElementById(id); if(el) el.checked = false; });
  }

  const grid = Array.from({length:6}, ()=>[]);
  for(let idx=0; idx<6; idx++){
    for(let di=0; di<DAYS.length; di++){
      grid[idx][di] = EMP_PATTERN_84[idx][di % EMP_PATTERN_84[idx].length];
    }
  }

  const warnings = [];

  // 1. Fixed Off (잠긴 구간의 날짜는 건너뜀)
  for(let i=0; i<6; i++){
    for(let k=0; k<3; k++){
      const fixDate = fixedOff[i][k];
      if(!fixDate) continue;
      const di = DAYS.findIndex(d => d.iso === fixDate);
      if(di === -1) continue;
      if(lockUsable && periodLocked[Math.floor(di/28)]) continue;
      if(grid[i][di] !== 'O'){
        const origShift = grid[i][di];
        grid[i][di] = 'O';
        if(origShift !== 'S'){
           let sWorkerIdx = grid.findIndex((row, w) => row[di] === 'S' && w !== i);
           if(sWorkerIdx !== -1){
              grid[sWorkerIdx][di] = origShift;
              warnings.push(`${DAYS[di].label}: ${EMP_NAMES[i]} 고정휴무 -> ${EMP_NAMES[sWorkerIdx]} 대직(${origShift})`);
           }
        }
      }
    }
  }

  // 2. Target Off logic - 목표 미달 시 '평일(월~금)' S근무만 휴무 전환 대상, 월~토 4명 유지 조건 하에서만 전환 (잠긴 구간은 건너뜀)
  for(let i=0; i<6; i++){
    for(let p=0; p<3; p++){
        if(lockUsable && periodLocked[p]) continue;
        const startDi = p * 28, endDi = startDi + 28;
        // 현재 오프 카운트
        let currentOffCount = 0;
        for(let di=startDi; di<endDi; di++) if(grid[i][di] === 'O') currentOffCount++;
        
        let deficit = targetOffDays[i][p] - currentOffCount;
        
        // 목표 미달 시 평일 S를 O로 변경 시도
        if(deficit > 0){
            for(let di=startDi; di<endDi; di++){
                const dow = DAYS[di].dow;
                const isWeekday = (dow >= 1 && dow <= 5); // 월~금
                if(isWeekday && grid[i][di] === 'S' && isSafeToOff(i, di, grid)){
                    grid[i][di] = 'O';
                    deficit--;
                    warnings.push(`${EMP_NAMES[i]} ${p+1}분기: 목표휴무 미달로 ${DAYS[di].label}(평일) S근무를 휴무로 변경`);
                    if(deficit <= 0) break;
                }
            }
        }
    }
  }

  // 3. 잠긴 구간은 이전 스케줄(수동 수정분 포함)로 그대로 덮어씀
  if(lockUsable){
    const periodLabels = ['1~4주','5~8주','9~12주'];
    for(let p=0; p<3; p++){
      if(!periodLocked[p]) continue;
      const startDi = p*28, endDi = Math.min(startDi+28, DAYS.length);
      for(let idx=0; idx<6; idx++){
        for(let di=startDi; di<endDi; di++){
          grid[idx][di] = prevGrid[idx][di];
        }
      }
      warnings.push(`[구간 고정] ${periodLabels[p]}은(는) 이전 스케줄을 그대로 유지했습니다.`);
    }
  }

  scheduleGrid = grid;
  lastWarnings = warnings;
  document.getElementById('genStatus').innerHTML = `생성 완료. 경고 ${warnings.length}건.`;
  renderScheduleTab();
}

document.getElementById('genBtn').addEventListener('click', generateSchedule);
['lockP0','lockP1','lockP2'].forEach((id,p)=>{
  document.getElementById(id).addEventListener('change', e=>{
    periodLocked[p] = e.target.checked;
  });
});

function computeStats(){
  const stats = [];
  for(let idx=0; idx<6; idx++){
    const c = {H:0,S:0,S2:0,N:0,W:0,AS:0,O:0};
    for(let di=0; di<DAYS.length; di++){
      const code = scheduleGrid[idx][di];
      c[code] = (c[code]||0)+1;
    }
    stats.push(c);
  }
  return stats;
}

function computeStatsByPeriod(){
  // 4주(28일) 단위 3구간 통계
  const periods = [[],[],[]];
  for(let p=0; p<3; p++){
    const startDi = p*28, endDi = Math.min(startDi+28, DAYS.length);
    for(let idx=0; idx<6; idx++){
      const c = {H:0,S:0,S2:0,N:0,W:0,AS:0,O:0};
      for(let di=startDi; di<endDi; di++){
        const code = scheduleGrid[idx][di];
        c[code] = (c[code]||0)+1;
      }
      periods[p].push(c);
    }
  }
  return periods;
}

function renderStatTables(){
  const wrap = document.getElementById('statTableWrap');
  wrap.innerHTML = '';
  const periodLabels = ['1주차~4주차', '5주차~8주차', '9주차~12주차'];
  const periodStats = computeStatsByPeriod();

  periodStats.forEach((periodData, p) => {
    let html = `<div class="stat-section-title">${periodLabels[p]} (해당 구간 휴무 목표 대비)</div>`;
    html += '<table class="stat-table"><tr><th>근무자</th><th>H</th><th>S</th><th>S2</th><th>N</th><th>W</th><th>AS</th><th>휴무(O)</th><th>목표</th></tr>';
    periodData.forEach((c, idx) => {
      const target = targetOffDays[idx][p];
      const cls = c.O >= target ? 'range-good' : 'range-bad';
      html += `<tr><td>${EMP_NAMES[idx]}</td><td>${c.H}</td><td>${c.S}</td><td>${c.S2}</td><td>${c.N}</td><td>${c.W}</td><td>${c.AS}</td><td class="${cls}">${c.O}</td><td>${target}</td></tr>`;
    });
    html += '</table>';
    wrap.innerHTML += html;
  });

  const totalStats = computeStats();
  let totalHtml = `<div class="stat-section-title">전체 (12주 합계)</div>`;
  totalHtml += '<table class="stat-table"><tr><th>근무자</th><th>H</th><th>S</th><th>S2</th><th>N</th><th>W</th><th>AS</th><th>전체 휴무(O)</th></tr>';
  totalStats.forEach((c, idx) => {
    totalHtml += `<tr><td>${EMP_NAMES[idx]}</td><td>${c.H}</td><td>${c.S}</td><td>${c.S2}</td><td>${c.N}</td><td>${c.W}</td><td>${c.AS}</td><td>${c.O}</td></tr>`;
  });
  totalHtml += '</table>';
  wrap.innerHTML += totalHtml;
}

function renderLegend(){
  const legend = document.getElementById('legend');
  legend.innerHTML = '';
  [['H','H'],['S','S'],['S2','S2'],['N','N'],['W','W'],['AS','AS'],['O','휴무']].forEach(([c,l]) => {
     legend.innerHTML += `<span><i class="c-${c}"></i>${l}</span>`;
  });
}

function renderScheduleTab(){
  renderLegend();
  const warnArea = document.getElementById('warnArea');
  warnArea.innerHTML = lastWarnings.length ? `<div class="warn-box"><b>⚠ 경고 및 적용 사항</b><br>${lastWarnings.slice(0,10).map(w=>`· ${w}`).join('<br>')}</div>` : '';
  
  const table = document.getElementById('schedTable');
  let html = '<tr><th style="position:sticky;left:0;">근무자</th>';
  DAYS.forEach((d,di)=>{
    const periodStart = (di > 0 && di % 28 === 0) ? ' period-start' : '';
    html += `<th class="${d.isHoliday ? 'holiday-col' : ''}${periodStart}">${d.label}</th>`;
  });
  html += '</tr>';
  for(let idx=0; idx<6; idx++){
    html += `<tr><td class="emp-name">${EMP_NAMES[idx]}</td>`;
    for(let di=0; di<DAYS.length; di++){
      const code = scheduleGrid[idx][di];
      const periodStart = (di > 0 && di % 28 === 0) ? ' period-start' : '';
      html += `<td class="${DAYS[di].isHoliday ? 'holiday-col' : ''}${periodStart}"><select class="cell-select c-${code}" data-emp="${idx}" data-day="${di}">` +
        SHIFT_CODES.map(c=>`<option value="${c}" ${c===code?'selected':''}>${c==='O'?'휴':CODE_LABEL[c]}</option>`).join('') +
        `</select></td>`;
    }
    html += '</tr>';
  }
  table.innerHTML = html;
  table.querySelectorAll('.cell-select').forEach(sel=>{
    sel.addEventListener('change', e=>{
      const emp = +e.target.dataset.emp, day = +e.target.dataset.day;
      const newCode = e.target.value;
      scheduleGrid[emp][day] = newCode;
      SHIFT_CODES.forEach(c=> e.target.classList.remove('c-'+c));
      e.target.classList.add('c-'+newCode);
      renderStatTables();
    });
  });

  // 통계 (4주 단위 세분화)
  renderStatTables();
}

// ===== 공통: 파일 다운로드 =====
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function pad2(n){ return String(n).padStart(2,'0'); }

// ===== 7. 엑셀(.xlsx) 다운로드 - 스케줄 색/스타일 동일 적용 =====
async function exportXlsx(){
  if(!scheduleGrid){ alert('먼저 스케줄을 생성하세요.'); return; }
  const wb = new ExcelJS.Workbook();
  const periodLabels = ['1주~4주', '5주~8주', '9주~12주'];
  for(let p=0; p<3; p++){
    const startDi = p*28, endDi = Math.min(startDi+28, DAYS.length);
    const ws = wb.addWorksheet(periodLabels[p]);
    const headerRow = ws.addRow(['근무자', ...DAYS.slice(startDi, endDi).map(d=>d.label)]);
    headerRow.eachCell(cell=>{
      cell.font = {bold:true};
      cell.alignment = {horizontal:'center', vertical:'middle'};
      cell.fill = {type:'pattern', pattern:'solid', fgColor:{argb:'FFF1F5F9'}};
    });
    for(let idx=0; idx<6; idx++){
      const rowVals = [EMP_NAMES[idx]];
      for(let di=startDi; di<endDi; di++) rowVals.push(scheduleGrid[idx][di] === 'O' ? '휴' : scheduleGrid[idx][di]);
      const row = ws.addRow(rowVals);
      row.getCell(1).font = {bold:true};
      row.getCell(1).alignment = {horizontal:'left', vertical:'middle'};
      for(let di=startDi; di<endDi; di++){
        const code = scheduleGrid[idx][di];
        const cell = row.getCell(di - startDi + 2);
        cell.alignment = {horizontal:'center', vertical:'middle'};
        cell.fill = {type:'pattern', pattern:'solid', fgColor:{argb:'FF'+SHIFT_HEX[code]}};
        cell.font = {bold:true, color:{argb:'FF'+SHIFT_TEXT_HEX[code]}};
      }
    }
    ws.columns.forEach((col, i)=>{ col.width = i===0 ? 12 : 6; });
    ws.eachRow(row=>{
      row.eachCell(cell=>{
        cell.border = {top:{style:'thin',color:{argb:'FFE2E8F0'}}, left:{style:'thin',color:{argb:'FFE2E8F0'}}, bottom:{style:'thin',color:{argb:'FFE2E8F0'}}, right:{style:'thin',color:{argb:'FFE2E8F0'}}};
      });
    });
  }
  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], {type:'application/octet-stream'}), '교대근무_스케줄.xlsx');
}
document.getElementById('exportXlsx').addEventListener('click', ()=>{
  exportXlsx().catch(err=>alert('엑셀 생성 실패: '+err.message));
});

// ===== 7. CSV 내보내기 / 가져오기 =====
function exportCsv(){
  if(!scheduleGrid){ alert('먼저 스케줄을 생성하세요.'); return; }
  let rows = ['근무자,' + DAYS.map(d=>d.iso).join(',')];
  for(let idx=0; idx<6; idx++) rows.push(EMP_NAMES[idx] + ',' + scheduleGrid[idx].join(','));
  const csv = rows.join('\n');
  downloadBlob(new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'}), '교대근무_스케줄.csv');
}
document.getElementById('exportCsv').addEventListener('click', exportCsv);

document.getElementById('importCsvBtn').addEventListener('click', ()=> document.getElementById('csvInput').click());
document.getElementById('csvInput').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const text = ev.target.result.replace(/^\uFEFF/, '');
      const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
      const header = lines[0].split(',');
      const isoList = header.slice(1);
      const startISO = isoList[0];
      document.getElementById('startDate').value = startISO;
      DAYS = buildDays(startISO, isoList.length);
      const grid = Array.from({length:6}, ()=>[]);
      for(let idx=0; idx<6 && idx+1<lines.length; idx++){
        const cols = lines[idx+1].split(',');
        EMP_NAMES[idx] = cols[0] || EMP_NAMES[idx];
        for(let di=0; di<isoList.length; di++) grid[idx][di] = (cols[di+1] || 'O').trim();
      }
      scheduleGrid = grid;
      lastWarnings = [];
      renderEmpNameGrid();
      renderFixOffTab();
      refreshHolidayNote();
      renderScheduleTab();
      document.getElementById('genStatus').textContent = 'CSV 가져오기 완료.';
    }catch(err){
      alert('CSV 가져오기 실패: ' + err.message);
    }
    e.target.value = '';
  };
  reader.readAsText(file, 'UTF-8');
});

// ===== 7. PNG 이미지 다운로드 (4주 단위 3장) =====
function buildPeriodTableEl(startDi, endDi){
  const table = document.createElement('table');
  table.className = 'sched';
  let html = '<tr><th style="position:static;">근무자</th>';
  for(let di=startDi; di<endDi; di++){
    html += `<th class="${DAYS[di].isHoliday ? 'holiday-col' : ''}">${DAYS[di].label}</th>`;
  }
  html += '</tr>';
  for(let idx=0; idx<6; idx++){
    html += `<tr><td class="emp-name" style="position:static;">${EMP_NAMES[idx]}</td>`;
    for(let di=startDi; di<endDi; di++){
      const code = scheduleGrid[idx][di];
      html += `<td class="${DAYS[di].isHoliday ? 'holiday-col' : ''}"><div class="cell c-${code}">${code === 'O' ? '휴' : code}</div></td>`;
    }
    html += '</tr>';
  }
  table.innerHTML = html;
  return table;
}
async function exportPng(){
  if(!scheduleGrid){ alert('먼저 스케줄을 생성하세요.'); return; }
  const periodLabels = ['1주~4주', '5주~8주', '9주~12주'];
  for(let p=0; p<3; p++){
    const startDi = p*28, endDi = Math.min(startDi+28, DAYS.length);
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff;padding:14px;';
    const title = document.createElement('div');
    title.textContent = `교대근무 스케줄 (${periodLabels[p]})`;
    title.style.cssText = 'font-weight:700;font-size:14px;margin-bottom:8px;color:#0F172A;';
    wrapper.appendChild(title);
    wrapper.appendChild(buildPeriodTableEl(startDi, endDi));
    document.body.appendChild(wrapper);
    const canvas = await html2canvas(wrapper, {backgroundColor:'#ffffff', scale:2});
    document.body.removeChild(wrapper);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl; a.download = `교대근무_스케줄_${periodLabels[p]}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
}
document.getElementById('exportPng').addEventListener('click', ()=>{
  exportPng().catch(err=>alert('PNG 생성 실패: '+err.message));
});

// ===== 7. iCal(.ics) 다운로드 =====
function icsDateStr(dateObj){
  return `${dateObj.getFullYear()}${pad2(dateObj.getMonth()+1)}${pad2(dateObj.getDate())}`;
}
function exportIcs(){
  if(!scheduleGrid){ alert('먼저 스케줄을 생성하세요.'); return; }
  const empIdx = +document.getElementById('icsEmployeeSelect').value;
  const includeOff = document.getElementById('icsIncludeOff').checked;
  const now = new Date();
  let lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//교대근무스케줄러//KO','CALSCALE:GREGORIAN'];
  for(let di=0; di<DAYS.length; di++){
    const code = scheduleGrid[empIdx][di];
    if(code === 'O' && !includeOff) continue;
    const d = DAYS[di].date;
    const nd = new Date(d); nd.setDate(d.getDate()+1);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${DAYS[di].iso}-${empIdx}-${code}@shift-scheduler`);
    lines.push(`DTSTAMP:${icsDateStr(now)}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${icsDateStr(d)}`);
    lines.push(`DTEND;VALUE=DATE:${icsDateStr(nd)}`);
    lines.push(`SUMMARY:${code === 'O' ? '휴무' : code + ' 근무'}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  downloadBlob(new Blob([lines.join('\r\n')], {type:'text/calendar;charset=utf-8;'}), `${EMP_NAMES[empIdx]}_스케줄.ics`);
}
document.getElementById('exportIcs').addEventListener('click', exportIcs);

// ===== 8. 스케줄 저장(.json) / 불러오기 =====
function saveScheduleJson(){
  if(!scheduleGrid){ alert('먼저 스케줄을 생성하세요.'); return; }
  const data = {
    version: 1,
    startDate: document.getElementById('startDate').value,
    empNames: EMP_NAMES,
    fixedOff: fixedOff,
    targetOffDays: targetOffDays,
    scheduleGrid: scheduleGrid,
    lastWarnings: lastWarnings,
    daysIso: DAYS.map(d=>d.iso),
    periodLocked: periodLocked
  };
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}), '스케줄_저장.json');
  document.getElementById('saveLoadStatus').textContent = '스케줄을 저장했습니다.';
}
document.getElementById('saveJsonBtn').addEventListener('click', saveScheduleJson);

document.getElementById('loadJsonBtn').addEventListener('click', ()=> document.getElementById('jsonInput').click());
document.getElementById('jsonInput').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const data = JSON.parse(ev.target.result);
      document.getElementById('startDate').value = data.startDate;
      EMP_NAMES = data.empNames || EMP_NAMES;
      fixedOff = data.fixedOff || fixedOff;
      targetOffDays = data.targetOffDays || targetOffDays;
      scheduleGrid = data.scheduleGrid || null;
      lastWarnings = data.lastWarnings || [];
      periodLocked = data.periodLocked || [false, false, false];
      ['lockP0','lockP1','lockP2'].forEach((id,p)=>{ const el = document.getElementById(id); if(el) el.checked = !!periodLocked[p]; });
      DAYS = buildDays(data.startDate, (data.daysIso && data.daysIso.length) || 84);
      renderEmpNameGrid();
      renderFixOffTab();
      refreshHolidayNote();
      if(scheduleGrid) renderScheduleTab();
      document.getElementById('saveLoadStatus').textContent = '저장된 스케줄을 불러왔습니다.';
    }catch(err){
      alert('불러오기 실패: ' + err.message);
    }
    e.target.value = '';
  };
  reader.readAsText(file, 'UTF-8');
});

// 초기화
renderEmpNameGrid();
renderFixOffTab();
refreshHolidayNote();