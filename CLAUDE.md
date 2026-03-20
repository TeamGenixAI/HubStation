# 박태영3 프로젝트 - Claude Code 지침서

## 프로젝트 개요
스마트팜 제어 시스템 웹 UI (농업 환경 제어)
- Spring Boot 백엔드와 WebSocket으로 통신
- Bootstrap 5 기반 반응형 UI
- PC/Pad + 모바일 통합 레이아웃

---

## 주요 파일 구조

```
D:/ClaudeCode/박태영3/
├── New-pc-pad.html          # PC/Pad 전용 HTML (수동 편집용 소스)
├── New-Mobile.html          # 모바일 전용 HTML (수동 편집용 소스)
├── New-merged.html          # 최종 결과물 — 직접 편집 대상
├── js/
│   ├── new-pc-tab-websocket.js    # PC 전용 WebSocket JS
│   ├── new-mobile-websocket.js    # 모바일 전용 WebSocket JS
│   └── merged-websocket.js        # 빌드 결과물 (자동 생성)
├── merge_html.py            # HTML 통합 스크립트
├── merge_js.py              # JS 통합 스크립트
├── 통합빌드.bat               # 빌드 배치파일 (실행 금지 — 아래 참고)
├── gen_html.py              # HTML 자동 생성 스크립트 (xlsx → html)
├── AiForSpring.json         # AI 태그 정의 (아날로그 입력)
├── DiForSpring.json         # DI 태그 정의 (디지털 입력)
├── DoForSpring.json         # DO 태그 정의 (디지털 출력/제어)
├── ParmForSpring.json       # Parameter 태그 정의 (설정값)
├── SocketForSpring.json     # WebSocket 연결 정보
└── assets/
    ├── bootstrap/
    ├── css/
    │   ├── styles.css
    │   ├── MainPannel.css
    │   ├── bss-overrides.css
    │   └── merged-layout.css  # 반응형 레이아웃 CSS
    └── js/
        ├── merged-websocket.js
        └── jquery-3.7.1.min.js
```

---

## 편집 워크플로우 (중요)

- **작업 대상: `New-merged.html` 직접 편집**
- `통합빌드.bat` **절대 실행 금지** — 실행 시 `New-merged.html` 덮어씌워짐
- `New-pc-pad.html`, `New-Mobile.html`은 참고용 소스일 뿐, 빌드에 사용하지 않음
- `New-merged-BSS.html`은 더 이상 사용하지 않음
- BSS(Bootstrap Studio) 연계 작업 중단 (2026-03-06)
- `gen_html.py` 실행 시 Python 경로: `/c/Python312/python.exe gen_html.py`

---

## HTML ID 명명 규칙

| 구분 | PC 레이아웃 | 모바일 레이아웃 |
|------|------------|----------------|
| 파라미터 | `P{번호}` | `m-P{번호}` |
| 디지털 입력 | `DI{번호}` | `m-DI{번호}` |
| 아날로그 입력 | `A{번호}` | `m-A{번호}` |
| 디지털 출력 T | `DO{번호}T` | `m-DO{번호}T` |
| 디지털 출력 F | `DO{번호}F` | `m-DO{번호}F` |
| 설정값 | `SP{번호}` | `m-SP{번호}` |
| 비트 플래그 | `P{번호}B{비트번호}` (예: `P90B1`) | |
| 분/초 분리 | `P{번호}M` (분), `P{번호}S` (초) | |

---

## JSON 태그 정의 구조

### ParmForSpring.json (설정 파라미터)
- `OnMsg`: 데이터 타입
  - `"int"` : 정수
  - `"ten"` : ÷10
  - `"100f"` : ÷100
  - `"bitbit"` : 비트마스크
  - `"secs"` : 초 → 분:초
- `OffMsg`: bitbit 타입이면 비트 번호, 그 외는 문자열
- `InstanceNo`: 배열 인덱스

### AiForSpring.json (아날로그 입력)
- `OnMsg`: `"int"`, `"ten"`(÷10), `"100f"`(÷100), `"float"`(4바이트 float)
- 표시 ID: `A{InstanceNo}`

### DiForSpring.json (디지털 입력)
- `UnitName`: `"NORMAL-MSG"`이면 OnMsg/OffMsg 텍스트 표시, 아니면 색상만 (green/gray)
- 표시 ID: `DI{InstanceNo}`

### DoForSpring.json (디지털 출력)
- 라디오 버튼 value 키워드로 codeVal 결정:
  - `START/star/run/on/VOPE/REMOT` → 1
  - `STOP/stop/off/VCLO/LOCA` → 0
  - `OPEN` → 2, `CLOS` → 3, `PAUS` → 4, `SCH/sch` → 6, `MAN/man` → 7

---

## WebSocket 통신

- 연결: `ws://{dnsName}:{webport}/websocketIO`
- 수신: `{ AITags: [...], DITags: [...] }`
- 송신 (설정값): `{ parm: [...] }`
- 송신 (DO): `{ "DO{번호}": codeVal }`

### 현재 접속 정보 (SocketForSpring.json)
- dnsName: `park3new.iptime.org`
- PORT: 44820, webport: 9832, stream: 8081

---

## 탭 구성

- **PC 탭**: 양액, 구역, 시간, 에어포그, 개폐기, 구동기, 보광등, 상태, 데이터추이
- **모바일 탭**: 양액, 구역, 시간, 에어포그, 개폐, 보광/유동팬, 환풍/훈증/CO2, 상태

---

## 레이아웃 규칙

### PC/패드 — justify-content-between
- `container.d-flex.flex-column`에 `min-height` 없으면 `justify-content-between` 동작 안 함
- `merged-layout.css`에서 전체 탭에 적용:
  ```css
  @media (min-width: 769px) {
      .tab-pane > .container.d-flex {
          min-height: calc(100vh - 80px);
      }
  }
  ```
- row 수: 최소 3개 이상 (`gen_html.py`의 `boxes_to_rows_html()` 기준)
  - `items_per_row = max(min_per_row=2, ceil(n / min_rows=3))`
- row 정렬: **항상 `justify-content-between`** (item 수와 무관)
  - `justify-content-start`로 분기하지 말 것 (확정된 원칙)
- 상태 탭(tab-8) row1~3: `align-items-start` 추가

### 반응형 브레이크포인트
| 범위 | 설명 |
|------|------|
| ≤768px | 모바일 (1카드/줄) |
| 769~991px | 중간 (PC 레이아웃, row-gap 2.5rem) |
| ≥992px | PC — 좌우 패딩 2rem, row-gap 1.5rem |
| ≥1200px | 좌우 패딩 3rem, row-gap 2rem |
| ≥1400px | 좌우 패딩 4rem, row-gap 2.5rem |

---

## CSS 주의사항

### Specificity 충돌
- `.tab-pane .d-flex.flex-row > *` → (0,3,0) + `!important`
- 오버라이드 시 specificity를 (0,4,0) 이상으로 높여야 함

### 핵심 CSS 규칙 (≤768px)
```css
/* 카드 1개/줄 */
.tab-pane .d-flex.flex-row > * { flex: 0 0 100% !important; }

/* 카드 내부 flex-row는 자연폭 유지 */
.tagBoxDisplay .d-flex.flex-row > * { flex: 0 0 auto !important; }

/* 라디오 1줄 */
.tagBoxDisplay:has(input[type="radio"]) { flex-direction: row; flex-wrap: nowrap; }

/* 체크박스 왼쪽 정렬 */
.tagBoxDisplay .form-check:has(input[type="checkbox"]) { width: auto; justify-content: flex-start; }
.tagBoxDisplay div:has(> .form-check input[type="checkbox"]) { justify-content: flex-start; }

/* ribbon 모바일 예외 — 전체 폭 차지 버그 방지 */
.tab-pane .d-flex.flex-row > .ribbon { width: auto !important; max-width: none !important; }
```

### 카드 내부 그룹화 패턴
관련 항목 묶기:
```html
<div class="d-inline-flex flex-row flex-wrap gap-2">
    <div class="d-inline-flex flex-row align-items-center">label + input + unit</div>
    <div class="d-inline-flex flex-row align-items-center">label + input + unit</div>
</div>
```

---

## gen_html.py 매핑 규칙

- `TagCategory` → 탭 이름
- `GroupName` → ribbon 텍스트 (동일 GroupName은 하나의 tagBoxDisplay로 합침)
- DO → 라디오 버튼 (UnitName=MODE이면 schedule/manual, 그 외 start/stop)
- Parm bitbit → 체크박스 (id=UnitName, label=TagName)
- Parm 그 외 → number input (앞=TagName, 뒤=UnitName)
- 같은 tagBoxDisplay 내 항목 순서: 엑셀 행 순서 그대로 (checkbox 우선 정렬 없음)
