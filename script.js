const SHIFT_CODES = ['H','S','S2','N','W','AS','O'];
const CODE_LABEL = {H:'H',S:'S',S2:'S2',N:'N',W:'W',AS:'AS',O:'휴무'};
const CRITICAL_SHIFTS = ['H','S','N','W']; // 월~토 최소 인원 유지 대상 (4명 필수)
const CRITICAL_MIN = 4;
const SUNDAY_CRITICAL_SHIFTS = ['AS','N','W']; // 일요일 최소 인원 유지 대상 (3명 필수)
const SUNDAY_CRITICAL_MIN = 3;
const SHIFT_HEX = {H:'3B82F6', S:'10B981', S2:'0EA5E9', N:'8B5CF6', W:'F59E0B', AS:'F43F5E', O:'E2E8F0'};
const SHIFT_TEXT_HEX = {H:'FFFFFF', S:'FFFFFF', S2:'FFFFFF', N:'FFFFFF', W:'1E293B', AS:'FFFFFF', O:'1E293B'};

// 연도별 공휴일 데이터. 미래 연도는 법정 주기가 확정된 항목(선거일 등)만 포함하며,
// 향후 정부가 추가 지정할 수 있는 임시공휴일(예: 대통령 보궐선거 등)은 반영되어 있지 않을 수 있음.
const HOLIDAYS_BY_YEAR = {
  2025: {
    '2025-01-01':'신정', '2025-01-27':'임시공휴일(설날)', '2025-01-28':'설날연휴', '2025-01-29':'설날', '2025-01-30':'설날연휴',
    '2025-03-01':'삼일절', '2025-03-03':'대체공휴일(삼일절)', '2025-05-01':'근로자의날',
    '2025-05-05':'어린이날·부처님오신날', '2025-05-06':'대체공휴일(어린이날·부처님오신날)',
    '2025-06-03':'임시공휴일(대통령선거일)', '2025-06-06':'현충일', '2025-07-17':'제헌절',
    '2025-08-15':'광복절', '2025-10-03':'개천절', '2025-10-05':'추석연휴', '2025-10-06':'추석',
    '2025-10-07':'추석연휴', '2025-10-08':'대체공휴일(추석)', '2025-10-09':'한글날', '2025-12-25':'크리스마스'
  },
  2026: {
    '2026-01-01':'신정', '2026-02-16':'설날연휴', '2026-02-17':'설날', '2026-02-18':'설날연휴',
    '2026-03-01':'삼일절', '2026-03-02':'대체공휴일(삼일절)', '2026-05-01':'근로자의날', '2026-05-05':'어린이날',
    '2026-05-24':'부처님오신날', '2026-05-25':'대체공휴일(부처님오신날)', '2026-06-03':'지방선거(임시공휴일)',
    '2026-06-06':'현충일', '2026-07-17':'제헌절', '2026-08-15':'광복절', '2026-08-17':'대체공휴일(광복절)',
    '2026-09-24':'추석연휴', '2026-09-25':'추석', '2026-09-26':'추석연휴', '2026-10-03':'개천절',
    '2026-10-05':'대체공휴일(개천절)', '2026-10-09':'한글날', '2026-12-25':'크리스마스'
  },
  2027: {
    '2027-01-01':'신정', '2027-02-06':'설날연휴', '2027-02-07':'설날', '2027-02-08':'설날연휴',
    '2027-02-09':'대체공휴일(설날)', '2027-03-01':'삼일절', '2027-05-01':'근로자의날', '2027-05-05':'어린이날',
    '2027-05-13':'부처님오신날', '2027-06-06':'현충일', '2027-07-17':'제헌절', '2027-08-15':'광복절',
    '2027-08-16':'대체공휴일(광복절)', '2027-09-14':'추석연휴', '2027-09-15':'추석', '2027-09-16':'추석연휴',
    '2027-10-03':'개천절', '2027-10-04':'대체공휴일(개천절)', '2027-10-09':'한글날',
    '2027-10-11':'대체공휴일(한글날)', '2027-12-25':'크리스마스', '2027-12-27':'대체공휴일(크리스마스)'
  },
  2028: {
    '2028-01-01':'신정', '2028-01-26':'설날연휴', '2028-01-27':'설날', '2028-01-28':'설날연휴',
    '2028-03-01':'삼일절', '2028-04-12':'국회의원선거일', '2028-05-01':'근로자의날', '2028-05-02':'부처님오신날',
    '2028-05-05':'어린이날', '2028-06-06':'현충일', '2028-07-17':'제헌절', '2028-08-15':'광복절',
    '2028-10-02':'추석연휴', '2028-10-03':'추석·개천절', '2028-10-04':'추석연휴',
    '2028-10-05':'대체공휴일(개천절)', '2028-10-09':'한글날', '2028-12-25':'크리스마스'
  },
  2029: {
    '2029-01-01':'신정', '2029-02-12':'설날연휴', '2029-02-13':'설날', '2029-02-14':'설날연휴',
    '2029-03-01':'삼일절', '2029-05-01':'근로자의날', '2029-05-05':'어린이날', '2029-05-07':'대체공휴일(어린이날)',
    '2029-05-20':'부처님오신날', '2029-05-21':'대체공휴일(부처님오신날)', '2029-06-06':'현충일',
    '2029-07-17':'제헌절', '2029-08-15':'광복절', '2029-09-21':'추석연휴', '2029-09-22':'추석',
    '2029-09-23':'추석연휴', '2029-09-24':'대체공휴일(추석)', '2029-10-03':'개천절', '2029-10-09':'한글날',
    '2029-12-25':'크리스마스'
  }
};
function getHoliday(iso){
  const year = +iso.slice(0,4);
  return HOLIDAYS_BY_YEAR[year] ? HOLIDAYS_BY_YEAR[year][iso] : undefined;
}

let EMP_NAMES = ['근무자1','근무자2','근무자3','근무자4','근무자5','근무자6'];
let fixedOff = [[],[],[],[],[],[]];
let targetOffDays = Array.from({length:6}, () => [4,4,4]); // 기본 4일
let DAYS = [];
let scheduleGrid = null;
let lastWarnings = [];
let periodLocked = [false, false, false];
let violatedDays = [];

function fmt(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
const DOW_KR = ['일','월','화','수','목','금','토'];

// 휴무 픽스 입력용: 연도 없이 "월-일"만 입력받고, 스케줄 기간에 맞는 연도를 자동으로 붙여준다.
function isoToMD(iso){
  if(!iso) return '';
  const parts = iso.split('-');
  return `${parts[1]}-${parts[2]}`;
}
function mdToIso(mdStr, minD, maxD){
  const m = mdStr.trim().match(/^(\d{1,2})[-\/.](\d{1,2})$/);
  if(!m) return null;
  const mm = m[1].padStart(2,'0'), dd = m[2].padStart(2,'0');
  const minYear = +minD.slice(0,4), maxYear = +maxD.slice(0,4);
  for(let y=minYear; y<=maxYear; y++){
    const candidate = `${y}-${mm}-${dd}`;
    const dt = new Date(candidate+'T00:00:00');
    if(isNaN(dt.getTime()) || fmt(dt) !== candidate) continue; // 2-30 같은 존재하지 않는 날짜 방지
    if(candidate >= minD && candidate <= maxD) return candidate;
  }
  return null;
}

function buildDays(startISO, totalDays){
  const start = new Date(startISO+'T00:00:00');
  const arr = [];
  for(let i=0;i<totalDays;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    const dow = d.getDay();
    const isWeekend = (dow===0 || dow===6);
    const iso = fmt(d);
    arr.push({date:d, iso, dow, isWeekend, isHoliday: !!getHoliday(iso), label:`${d.getMonth()+1}/${d.getDate()}(${DOW_KR[dow]})`});
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
    for(let k=0;k<6;k++){
      const val = isoToMD(fixedOff[i][k]);
      html += `<input type="text" inputmode="numeric" placeholder="월-일 (예: 08-15)" maxlength="5" value="${val}" data-idx="${i}" data-k="${k}" class="fixOffInput">`;
    }
    html += `</div>`;
    box.innerHTML = html;
    g.appendChild(box);
  }
  g.querySelectorAll('.fixOffInput').forEach(inp=>{
    inp.addEventListener('change', e=>{
      const idx = +e.target.dataset.idx, k = +e.target.dataset.k;
      const raw = e.target.value.trim();
      if(!raw){
        fixedOff[idx][k] = '';
        e.target.classList.remove('invalid');
        return;
      }
      const iso = mdToIso(raw, minD, maxD);
      if(iso){
        fixedOff[idx][k] = iso;
        e.target.value = isoToMD(iso);
        e.target.classList.remove('invalid');
      } else {
        fixedOff[idx][k] = '';
        e.target.classList.add('invalid');
      }
    });
  });
}

function refreshHolidayNote(){
  const startISO = document.getElementById('startDate').value;
  const days = buildDays(startISO, 84);
  const found = days.filter(d=>d.isHoliday);
  const yearsInRange = [...new Set(days.map(d=>d.date.getFullYear()))];
  const noHolidayData = yearsInRange.every(y => !HOLIDAYS_BY_YEAR[y]);
  let msg = found.length > 0 ? `이 기간 공휴일 (총 ${found.length}일): ${found.map(d=>d.label).join(', ')}` : '이 기간 공휴일: 없음 (총 0일).';
  if(noHolidayData) msg += ' (해당 연도는 공휴일 데이터가 등록되어 있지 않습니다)';
  document.getElementById('holidayNote').textContent = msg;
}

// 상단의 작은 '연도' 셀렉트 - 시작일의 연도만 빠르게 바꿀 수 있게 해준다.
function populateYearQuickSelect(){
  const sel = document.getElementById('yearQuickSelect');
  if(!sel) return;
  const curYear = +document.getElementById('startDate').value.slice(0,4);
  const base = new Date().getFullYear();
  const years = new Set([curYear]);
  for(let y=base-1; y<=base+3; y++) years.add(y);
  const sorted = [...years].sort((a,b)=>a-b);
  sel.innerHTML = sorted.map(y => `<option value="${y}" ${y===curYear?'selected':''}>${y}${HOLIDAYS_BY_YEAR[y] ? '' : ' (공휴일 데이터 없음)'}</option>`).join('');
}
document.getElementById('yearQuickSelect').addEventListener('change', e=>{
  const startEl = document.getElementById('startDate');
  startEl.value = e.target.value + startEl.value.slice(4);
  refreshHolidayNote();
  renderFixOffTab();
});

document.getElementById('startDate').addEventListener('change', () => {
    refreshHolidayNote();
    renderFixOffTab();
    populateYearQuickSelect();
});

// 핵심 로직 - 제공된 근무패턴(엑셀)을 인원별 84일 그대로 사용 (가공 없음)
const EMP_PATTERN_84 = [
  ['S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS'],
  ['N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','O','O','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','N','W'],
  ['O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','N','W','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','O','O'],
  ['S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','O','O','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','N','W','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O'],
  ['W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N'],
  ['H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','O','S','S','N','W','O','H','AS','S','N','W','O','H','O','O','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O','H','S','S','N','W','O']
];

// 요일별 최소 인원 규칙: 월~토는 S,N,W,H 4명 이상, 일요일은 AS,N,W 3명 이상.
function dayRequirement(dow){
    return dow === 0 ? {shifts: SUNDAY_CRITICAL_SHIFTS, min: SUNDAY_CRITICAL_MIN} : {shifts: CRITICAL_SHIFTS, min: CRITICAL_MIN};
}
function countCritical(currentGrid, dayIdx, dow, excludeIdx){
    const req = dayRequirement(dow);
    let count = 0;
    for(let i=0; i<6; i++){
        if(i !== excludeIdx && req.shifts.includes(currentGrid[i][dayIdx])) count++;
    }
    return count;
}
function isSafeToOff(empIdx, dayIdx, currentGrid) {
    const dow = DAYS[dayIdx] ? DAYS[dayIdx].dow : null;
    if(dow === null) return true;
    const req = dayRequirement(dow);
    return countCritical(currentGrid, dayIdx, dow, empIdx) >= req.min;
}
// 생성이 끝난 스케줄 전체를 훑어 규칙(월~토 4명 / 일요일 3명)이 깨진 날짜 인덱스를 모아 반환한다.
function computeViolatedDays(currentGrid){
    const violated = [];
    for(let di=0; di<DAYS.length; di++){
        const dow = DAYS[di].dow;
        const req = dayRequirement(dow);
        if(countCritical(currentGrid, di, dow, -1) < req.min) violated.push(di);
    }
    return violated;
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
    for(let k=0; k<6; k++){
      const fixDate = fixedOff[i][k];
      if(!fixDate) continue;
      const di = DAYS.findIndex(d => d.iso === fixDate);
      if(di === -1) continue;
      if(lockUsable && periodLocked[Math.floor(di/28)]) continue;
      if(grid[i][di] === 'O') continue;
      const origShift = grid[i][di];

      // N,W는 한 사람이 이틀 연속으로 수행하는 연속근무이므로, 대직 시에도 N,W 전체를
      // '이틀 연속 S근무'인 대직자에게 통째로 넘겨 N,W가 서로 다른 사람으로 쪼개지지 않게 한다.
      if(origShift === 'N' || origShift === 'W'){
        const pairStart = origShift === 'N' ? di : di - 1;
        const pairEnd = pairStart + 1;
        const pairUsable = pairStart >= 0 && pairEnd < DAYS.length
          && grid[i][pairStart] === 'N' && grid[i][pairEnd] === 'W'
          && !(lockUsable && periodLocked[Math.floor(pairStart/28)])
          && !(lockUsable && periodLocked[Math.floor(pairEnd/28)]);
        if(pairUsable){
          const subIdx = grid.findIndex((row, w) => w !== i && row[pairStart] === 'S' && row[pairEnd] === 'S');
          if(subIdx !== -1){
            grid[i][pairStart] = 'S';
            grid[i][pairEnd] = 'S';
            grid[subIdx][pairStart] = 'N';
            grid[subIdx][pairEnd] = 'W';
            grid[i][di] = 'O';
            warnings.push(`${DAYS[pairStart].label}~${DAYS[pairEnd].label}: ${EMP_NAMES[i]} 고정휴무로 N,W 연속근무를 ${EMP_NAMES[subIdx]}에게 통째로 대직`);
            continue;
          }
        }
      }

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

  // 4. 최종 인원 규칙 검증 (월~토 4명 / 일요일 3명) - 깨진 날짜는 휴무를 되돌리지 않고 화면에 빨간 테두리로만 표시
  violatedDays = computeViolatedDays(grid);
  if(violatedDays.length > 0){
    warnings.push(`⚠ 최소 인원 규칙 위반 (${violatedDays.length}일): ${violatedDays.map(di=>DAYS[di].label).join(', ')}`);
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
    const violation = violatedDays.includes(di) ? ' day-violation' : '';
    html += `<th data-day="${di}" class="${d.isHoliday ? 'holiday-col' : ''}${periodStart}${violation}">${d.label}</th>`;
  });
  html += '</tr>';
  for(let idx=0; idx<6; idx++){
    html += `<tr><td class="emp-name">${EMP_NAMES[idx]}</td>`;
    for(let di=0; di<DAYS.length; di++){
      const code = scheduleGrid[idx][di];
      const periodStart = (di > 0 && di % 28 === 0) ? ' period-start' : '';
      const violation = violatedDays.includes(di) ? ' day-violation' : '';
      html += `<td data-day="${di}" class="${DAYS[di].isHoliday ? 'holiday-col' : ''}${periodStart}${violation}"><select class="cell-select c-${code}" data-emp="${idx}" data-day="${di}">` +
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
      violatedDays = computeViolatedDays(scheduleGrid);
      applyViolationHighlight();
      renderStatTables();
    });
  });

  // 통계 (4주 단위 세분화)
  renderStatTables();
}

// 전체 재렌더링 없이, 규칙 위반 날짜의 빨간 테두리 표시만 갱신한다 (수동 셀 수정 시 사용).
function applyViolationHighlight(){
  const table = document.getElementById('schedTable');
  table.querySelectorAll('[data-day]').forEach(el=>{
    el.classList.toggle('day-violation', violatedDays.includes(+el.dataset.day));
  });
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
      populateYearQuickSelect();
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
populateYearQuickSelect();