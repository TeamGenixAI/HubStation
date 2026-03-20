# 박태영3 프로젝트 메모리

## 프로젝트 개요
스마트팜 제어 시스템 웹 UI (농업 환경 제어)
- Spring Boot 백엔드와 WebSocket으로 통신
- Bootstrap 5 기반 반응형 UI
- PC/Pad 레이아웃 + 모바일 레이아웃 통합 빌드 구조

## 주요 파일 구조
```
D:/ClaudeCode/박태영3/
├── New-pc-pad.html          # PC/Pad 전용 HTML (수동 편집)
├── New-Mobile.html          # 모바일 전용 HTML (수동 편집)
├── New-merged.html          # 빌드 결과물 (자동 생성, 직접 편집 X)
├── js/
│   ├── new-pc-tab-websocket.js    # PC 전용 WebSocket JS
│   ├── new-mobile-websocket.js    # 모바일 전용 WebSocket JS
│   └── merged-websocket.js        # 빌드 결과물 (자동 생성)
├── merge_html.py            # HTML 통합 스크립트
├── merge_js.py              # JS 통합 스크립트
├── 통합빌드.bat               # 빌드 실행 배치파일
├── AiForSpring.json         # AI 태그 정의 (아날로그 입력)
├── DiForSpring.json         # DI 태그 정의 (디지털 입력)
├── DoForSpring.json         # DO 태그 정의 (디지털 출력/제어)
├── ParmForSpring.json       # Parameter 태그 정의 (설정값)
├── SocketForSpring.json     # WebSocket 연결 정보
└── assets/
    ├── bootstrap/           # Bootstrap CSS/JS
    ├── css/
    │   ├── styles.css
    │   ├── MainPannel.css
    │   ├── bss-overrides.css
    │   └── merged-layout.css  # 반응형 레이아웃 CSS (New-merged.html에서 분리)
    └── js/
        ├── merged-websocket.js
        ├── jquery-3.7.1.min.js
        └── ...
```

## 빌드 시스템
- `통합빌드.bat` 실행 → `merge_html.py` + `merge_js.py` 순서로 실행
- `New-merged.html`과 `js/merged-websocket.js`가 최종 결과물
- **작업 대상은 `New-merged.html` 직접 편집** (merge_html.py/merge_js.py 경유 X)

## HTML ID 명명 규칙
- PC 레이아웃: `P{번호}`, `DI{번호}`, `A{번호}`, `DO{번호}T/F`, `SP{번호}`
- 모바일 레이아웃: `m-P{번호}`, `m-DI{번호}`, `m-A{번호}`, `m-DO{번호}T/F`, `m-SP{번호}`
- 비트 플래그: `P{번호}B{비트번호}` (예: `P90B1`)
- 분/초 분리: `P{번호}M` (분), `P{번호}S` (초)

## JSON 태그 정의 구조
### ParmForSpring.json (설정 파라미터)
- `OnMsg`: 데이터 타입 ("int", "ten"=÷10, "100f"=÷100, "bitbit"=비트마스크, "secs"=초→분:초)
- `OffMsg`: bitbit 타입은 비트 번호, 그 외는 문자열
- `InstanceNo`: 배열 인덱스

### AiForSpring.json (아날로그 입력)
- `OnMsg`: "int", "ten"(÷10), "100f"(÷100), "float"(4바이트 float)
- 표시 ID: `A{InstanceNo}`

### DiForSpring.json (디지털 입력)
- `UnitName`: "NORMAL-MSG"이면 OnMsg/OffMsg 텍스트 표시, 아니면 색상만 (green/gray)
- 표시 ID: `DI{InstanceNo}`

### DoForSpring.json (디지털 출력)
- 라디오 버튼 value 키워드로 codeVal 결정
- START/star/run/on/VOPE/REMOT → 1, STOP/stop/off/VCLO/LOCA → 0
- OPEN → 2, CLOS → 3, PAUS → 4, SCH/sch → 6, MAN/man → 7

## WebSocket 통신
- 연결: `ws://{dnsName}:{webport}/websocketIO`
- 수신: `{ AITags: [...], DITags: [...] }` 형태
- 송신 (설정): `{ parm: [...] }` 배열
- 송신 (DO): `{ "DO{번호}": codeVal }`

## 현재 접속 정보 (SocketForSpring.json)
- dnsName: park3new.iptime.org
- PORT: 44820, webport: 9832, stream: 8081

## 탭 구성
### PC 탭: 양액, 구역, 시간, 에어포그, 개폐기, 구동기, 보광등, 상태, 데이터추이
### 모바일 탭: 양액, 구역, 시간, 에어포그, 개폐, 보광/유동팬, 환풍/훈증/CO2, 상태

## PC/패드 레이아웃 justify-content-between (전체 탭 공통)
- **조건**: `container.d-flex.flex-column`에 `min-height`가 없으면 `justify-content-between` 동작 안 함
- **해결**: `merged-layout.css`에서 **전체 탭**에 적용
  ```css
  @media (min-width: 769px) {
      .tab-pane > .container.d-flex {
          min-height: calc(100vh - 80px);
      }
  }
  ```
- **row 수**: **최소 3개 이상** (3개 이상이지 정확히 3개가 아님)
  - `gen_html.py`의 `boxes_to_rows_html()`에서 `items_per_row = max(min_per_row=2, ceil(n / min_rows=3))`
  - row 정렬: **항상 `justify-content-between`** (item 수와 무관하게 적용)
  - `justify-content-start`로 분기하지 말 것 — 사용자 확인된 원칙
- 상태 탭(tab-8) row1~3에 `align-items-start` 추가 (기본 stretch → 카드 내용 높이에 맞춤)

## CSS Specificity 주의사항
### !important 충돌 시 specificity가 높은 쪽이 이김
- `.tab-pane .d-flex.flex-row > *` → (0,3,0) + !important
- 이를 오버라이드하려면 선택자 specificity를 (0,4,0) 이상으로 높여야 함
- **ribbon 모바일 예외 규칙 (해결됨)**:
  ```css
  /* ≤768px 미디어쿼리 안에서 */
  .tab-pane .d-flex.flex-row > .ribbon {
      width: auto !important;
      max-width: none !important;
  }
  ```
  - `.ribbon`이 `.d-flex.flex-row`의 직계 자식인 경우 (개폐설정, 구동기, 보광기 탭 등)
    `width: 100% !important`가 강제 적용되어 전체 폭을 차지하던 버그 수정

## 반응형 CSS 구조 (New-merged.html <style> 블록)
### 브레이크포인트별 레이아웃
- ≤768px : 모바일 (1카드/줄, 카드내부 자연폭)
- 769~991px : 중간 (PC 레이아웃 동일, row-gap 2.5rem)
- ≥992px (lg) : PC — 좌우 패딩 2rem, row-gap 1.5rem
- ≥1200px (xl) : 좌우 패딩 3rem, row-gap 2rem
- ≥1400px (xxl): 좌우 패딩 4rem, row-gap 2.5rem

### 핵심 CSS 규칙 (≤768px)
- `.tab-pane .d-flex.flex-row > *` → `flex:0 0 100%` : 카드 1개/줄
- `.tagBoxDisplay .d-flex.flex-row > *` → `flex:0 0 auto` : 카드 **내부** flex-row 자연폭 유지
- `.tagBoxDisplay:has(input[type="radio"])` → `flex-direction:row; flex-wrap:nowrap` : 라디오 1줄
- `.tagBoxDisplay .form-check:has(input[type="checkbox"])` → `width:auto; justify-content:flex-start` : 체크박스 왼쪽
- `.tagBoxDisplay div:has(> .form-check input[type="checkbox"])` → `justify-content:flex-start` : 체크박스 부모 왼쪽

### 카드 내부 그룹화 패턴 (CO2 기준)
관련 항목 묶기: `<div class="d-inline-flex flex-row flex-wrap gap-2">`
  └ 각 아이템: `<div class="d-inline-flex flex-row align-items-center">label+input+unit</div>`

### HTML 수정 이력 (New-merged.html 직접 편집)
- CO2 카드: 설정치+편차 → `d-inline-flex flex-row flex-wrap gap-2`로 묶음 (2개 행)
- 개폐설정1/2: 온도+편차 → 동일 패턴으로 묶음
- 유동팬 행1/2: `text-center justify-content-center` 구조 → [선택+℃]/[편차+℃] 그룹 재구성

## HTML 자동 생성 스크립트 (gen_html.py)
- **파일**: `D:/ClaudeCode/박태영3/gen_html.py`
- **실행**: `/c/Python312/python.exe gen_html.py` (Python 3.12 경로 주의)
- **입력**: `DoForSpring.xlsx` + `ParmForSpring.xlsx`
- **출력**: `testmerge.html`

### 매핑 규칙
- `TagCategory` → 탭 이름
- `GroupName` → ribbon 텍스트, **동일 GroupName은 하나의 tagBoxDisplay로 합침**
- DO → 라디오 버튼 (UnitName=MODE면 schedule/manual, 그 외 start/stop)
- Parm bitbit → 체크박스 (id=UnitName, label=TagName)
- Parm 그 외 → number input (앞=TagName, 뒤=UnitName)
- 같은 tagBoxDisplay 내 항목 순서: **엑셀 행 순서 그대로** (checkbox 우선 정렬 없음)

### 다음 개선 예정 항목 (미완)
- 탭 순서 지정 기능
- 행(row) 그룹화 레이아웃
- 추가 입력 타입 처리

## 편집 워크플로우
- **BSS(Bootstrap Studio) 연계 작업 중단** (2026-03-06)
- **작업 대상: `New-merged.html` 직접 편집**
- `통합빌드.bat` 절대 실행 금지 — 실행 시 작업 덮어씌워짐
- `New-merged-BSS.html` 파일은 더 이상 사용하지 않음
