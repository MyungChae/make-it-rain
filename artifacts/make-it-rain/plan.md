# make-it-rain 구현 계획

## Context

`artifacts/make-it-rain/spec.md`에 정의된 60초 캐주얼 클릭 게임을 Next.js App Router로 구현한다. 13개 시나리오·불변 규칙·미결정 항목을 모두 다루며, 의존성이 적은 슬라이스부터 vertical slice로 쌓아 각 Task 종료 시점에 시스템이 동작 가능한 상태로 남도록 한다.

게임이라는 UI 특성상 자동화하기 어려운 동작(체감 가속, 클릭 반응성)도 있으므로 검증은 — Vitest(단위·통합) → Playwright(E2E 전환) → 사용자 수동 플레이 — 세 층을 조합한다.

## 진행 현황

| Task | 상태 | 완료 기준 |
|---|---|---|
| Task 1 — 메뉴 + 최고 점수 | ✅ 완료 | 11개 테스트(storage 6 + MenuScreen 5) 통과, 빌드 성공 |
| Task 2 — 카운트다운 + HUD/보드 골격 | 🔲 대기 | — |
| Task 3 — 객체 낙하·클릭·땅 도달 | 🔲 대기 | — |
| Task 4 — 시간 가속 + 라운드 종료 + 결과 화면 | 🔲 대기 | — |
| Task 5 — 최고점 갱신 + 다시하기 + 메뉴 이동 | 🔲 대기 | — |
| Task 6 — 부스터 충전 | 🔲 대기 | — |
| Task 7 — 부스터 발동 + 중첩 방지 | 🔲 대기 | — |
| Task 8 — 테마·반응형·접근성·E2E | 🔲 대기 | — |

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 객체 시각 디자인 | wireframe 도형 그대로 (CSS 모양 + +N/-N 라벨) | 색맹 친화, OS 의존 없음, 추가 에셋 0 |
| 부스터 UI 위치 | HUD 우측(SCORE · TIME · BOOSTER 3분할) | 모바일 엄지 도달 + 보드 시야 미침범 |
| 가속 곡선 | 선형 (60초 동안 spawn 빈도·낙하 속도 1배→2.5배) | 튜닝·검증·체감 변화 모두 단순 |
| 게임 루프 구동 | `requestAnimationFrame` 기반 시간 누적 | 60fps 부드러움, 탭 비활성 시 자동 일시정지 |
| 객체 위치 모델 | 보드 컨테이너 `position:relative` + 각 객체 `position:absolute`, x는 % / y는 px | wireframe과 일치, 반응형 자연 처리 |
| 시간 단위 | ms 단위 ts(start time) + 절대 시간 비교 | setInterval 누적 오차 회피, 일시정지·확장 시 견고 |
| 상태 관리 | 단일 `useGameLoop` 훅 (페이즈 머신) + 로컬 상태 | 외부 상태 라이브러리 불필요(60초 단발 라운드) |
| 클릭 충돌 판정 | 각 Drop의 onClick 핸들러 (이벤트 위임 X) | hitbox = DOM 박스로 자연 처리, ≥44px 보장 |
| 시스템 테마 | `next-themes` `enableSystem={true}` `defaultTheme="system"` | spec의 "시스템 설정에 따라 자동 적용" 충족 |
| 최고 점수 저장 | `localStorage`, key `make-it-rain:best` | spec 불변 규칙: 최고점만 저장 |
| 부스터 임계점 알고리즘 | `Math.floor(score/200)` 비교, 라운드별 `crossedCount` 추적 | 시나리오 11의 "한 번에 여러 임계점 통과" 자연 처리 |

## 인프라 리소스

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
| None | — | — | — |

순수 클라이언트 게임. 서버·DB·서드파티 의존성 없음.

## 데이터 모델

### types/game.ts (✅ 구현 완료)

```ts
type DropKind = 'coin' | 'bill' | 'gold' | 'bubble-s' | 'bubble-l';
type Phase = 'menu' | 'countdown' | 'playing' | 'result';

interface Drop {
  id: string;              // crypto.randomUUID()
  kind: DropKind;
  xPct: number;            // 0~100 (보드 폭 대비 %)
  yPx: number;             // 0~boardHeight
  vyPxPerSec: number;      // 낙하 속도
  spawnedAt: number;       // ms timestamp
}

interface GameStats {
  coin: number;            // 잡은 개수
  bill: number;
  gold: number;
  'bubble-s': number;
  'bubble-l': number;
}

interface RoundState {
  score: number;
  timeLeftSec: number;     // 60 → 0 (정수, HUD 표시용)
  startedAt: number;       // ms timestamp
  drops: Drop[];
  stats: GameStats;
  boosters: number;
  lastBoosterThreshold: number;  // 발급한 최고 임계점 (200·400·…)
  boosterEndsAt: number | null;  // 활성 시 종료 ms timestamp
}
```

### config/game.ts (✅ 구현 완료)

| 키 | 값 | 출처 |
|---|---|---|
| ROUND_SEC | 60 | spec |
| COUNTDOWN_SEC | 3 | spec |
| SCORES | coin:+5, bill:+15, gold:+50, bubble-s:-5, bubble-l:-20 | spec |
| BOOSTER_THRESHOLD | 200 | spec |
| BOOSTER_DURATION_MS | 3000 | spec |
| BASE_SPAWN_INTERVAL_MS | 700 | 튜닝 시작점 |
| MAX_SPEED_MULTIPLIER | 2.5 | "선형 1배→2.5배" |
| BASE_FALL_PX_PER_SEC | 180 | 튜닝 시작점 |
| SPAWN_WEIGHTS_NORMAL | coin:6, bill:3, gold:1, bubble-s:3, bubble-l:1 | 미결정 → plan 단계 결정 |
| SPAWN_WEIGHTS_BOOSTER | coin:5, bill:3, gold:1, bubble-s:0, bubble-l:0 | spec ("5배·3배·1배" + "비누방울 0") |
| BEST_SCORE_KEY | "make-it-rain:best" | — |

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| `shadcn` | 1, 4, 8 | Button·Card·Badge 사용. `components/ui/*` 직접 수정 금지. semantic token만 |
| `next-best-practices` | 모든 Task | `'use client'` 경계, App Router 메타데이터, 클라이언트 훅 분리 |
| `vercel-react-best-practices` | 3, 6, 7 | RAF 루프, 메모이제이션, 리렌더 최소화 |
| `web-design-guidelines` | 8 | 클릭 영역 ≥44px, 시각 식별성, 다크모드 검증 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/game.ts` | ✅ New | 1 |
| `config/game.ts` | ✅ New | 1 |
| `lib/storage.ts` + `.test.ts` | ✅ New | 1 |
| `lib/score.ts` + `.test.ts` | New | 3, 6 (확장) |
| `lib/spawner.ts` + `.test.ts` | New | 3, 4 (가속), 7 (부스터 분기) |
| `hooks/useBestScore.ts` + `.test.ts` | ✅ New | 1 (recordIfBest 포함 완전 구현) |
| `hooks/useGameLoop.ts` + `.test.ts` | New | 2, 3, 4, 5, 6, 7 (점진 확장) |
| `components/game/MenuScreen.tsx` + `.test.tsx` | ✅ New | 1 |
| `components/game/GameBoard.tsx` + `.test.tsx` | New | 2, 3 (drop 렌더) |
| `components/game/Hud.tsx` + `.test.tsx` | New | 2, 6 (부스터 카운트), 7 (모드 표시) |
| `components/game/Drop.tsx` + `.test.tsx` | New | 3 |
| `components/game/ResultScreen.tsx` + `.test.tsx` | New | 4, 5 (NEW BEST) |
| `app/page.tsx` | Modify | 2 (페이즈 분기), 5 (recordIfBest 연결) |
| `app/layout.tsx` | Modify | 8 (`enableSystem={true}`, metadata 변경) |
| `e2e/game.spec.ts` | New | 8 |
| `e2e/smoke.spec.ts` | Modify | 8 (게임 페이지 진입 확인으로 갱신) |

---

## Tasks

### ✅ Task 1: 메뉴 화면 + 최고 점수 표시 — 완료

- **담당 시나리오**: Scenario 1 (full)
- **크기**: M (6 파일)
- **구현 파일**: `types/game.ts`, `config/game.ts`, `lib/storage.ts`, `hooks/useBestScore.ts`, `components/game/MenuScreen.tsx`, `app/page.tsx` (MenuScreen만 렌더)
- **비고**: `useBestScore`에 `recordIfBest`까지 구현 완료 — Task 5에서 별도 확장 불필요

---

### Task 2: 카운트다운 진입 + HUD/보드 골격

- **담당 시나리오**: Scenario 2 (full)
- **크기**: M (5 파일)
- **의존성**: Task 1 (page · types)
- **참조**:
  - `next-best-practices` — 클라이언트 훅 분리, `useEffect` 정리
  - `artifacts/make-it-rain/wireframe.html` Screen 1
- **구현 대상**:
  - `hooks/useGameLoop.ts` + `.test.ts` — 페이즈 머신 스켈레톤. 노출 API: `{ phase, score, timeLeftSec, countdown, start() }`. 이 Task에서는 score=0, timeLeftSec=60 고정, countdown은 3→2→1→null 1초 간격.
  - `components/game/Hud.tsx` + `.test.tsx` — props: `{ score, timeLeftSec, boosters?: number, boosterActive?: boolean, onBooster?: () => void }`. BOOSTER 슬롯을 Task 2에서 구조로 확보해 두고 Task 6에서 채운다.
  - `components/game/GameBoard.tsx` + `.test.tsx` — props: `{ children?, countdown? }`. `position:relative; overflow:hidden; height:480px` (반응형은 Task 8). 바닥 라인. `countdown !== null`이면 중앙 큰 숫자.
  - `app/page.tsx` — phase에 따라 MenuScreen / (Hud + GameBoard) 분기.
- **수용 기준**:
  - [ ] "시작" 버튼 클릭 직후 메뉴가 사라지고 카운트다운 "3"이 보드 중앙에 표시된다 (SC1)
  - [ ] 카운트다운이 1초 간격으로 3 → 2 → 1로 차례로 표시된 뒤 사라진다 (SC2)
  - [ ] 카운트다운이 끝난 시점에 점수 0, 남은 시간 60이 HUD에 표시된다 (SC3)
  - [ ] 카운트다운이 끝난 직후 phase가 `'playing'`으로 전환된다 (SC4 — 객체 낙하 시작은 Task 3에서)
- **검증**:
  - `bun run test -- hooks/useGameLoop components/game/Hud components/game/GameBoard`
  - `bun run build`

---

### Task 3: 객체 낙하 + 클릭 득점/감점 + 땅 도달 소멸

- **담당 시나리오**: Scenario 3 (full), Scenario 4 (full), Scenario 5 (full)
- **크기**: M (5 파일)
- **의존성**: Task 2 (게임 루프 골격)
- **참조**:
  - `vercel-react-best-practices` — RAF 루프, React.memo로 Drop 리렌더 최소화
  - `shadcn` — `styling.md` (semantic token만)
- **구현 대상**:
  - `lib/spawner.ts` + `.test.ts` — `pickKind(rng, mode: 'normal' | 'booster'): DropKind` (가중치 추출), `createDrop(now, kind, boardWidth): Drop`. 이 Task에서는 상수 인터벌(BASE) 사용.
  - `lib/score.ts` + `.test.ts` — `applyHit(score, kind, scores): number`. 단순 합산. (임계점 통과는 Task 6.)
  - `components/game/Drop.tsx` + `.test.tsx` — props: `{ drop, onClick }`. wireframe의 5종 도형 + 라벨. `React.memo`. 최소 크기: coin·bubble-s 36px, 나머지 ≥44px (Task 8에서 hitbox 보강).
  - `hooks/useGameLoop.ts` 확장 — RAF 루프 추가: 시간 누적, spawn 타이머, drops 위치 갱신, 땅 도달 시 제거, 클릭 시 점수 변경 + drops에서 제거. `onClickDrop(id)` 노출.
  - `components/game/GameBoard.tsx` 확장 — drops 배열 받아 `<Drop>` 렌더.
- **수용 기준**:
  - [ ] 동전 클릭 → 점수 +5, 동전이 DOM에서 제거됨 (Scenario 3 SC1)
  - [ ] 지폐 클릭 → 점수 +15, 지폐 제거 (SC2)
  - [ ] 금괴 클릭 → 점수 +50, 금괴 제거 (SC3)
  - [ ] 클릭한 객체 위치에서 페이드아웃·스케일 등 짧은 시각 피드백이 보인 뒤 사라진다 (SC4 — CSS transition)
  - [ ] HUD 점수가 클릭 직후(같은 프레임) 새 값으로 표시된다 (SC5)
  - [ ] 작은 비누방울 클릭 → 점수 -5, 비누방울 제거 (Scenario 4 SC1)
  - [ ] 큰 비누방울 클릭 → 점수 -20 (SC2)
  - [ ] 점수 0에서 비누방울 클릭 → 점수가 음수 표시된다 (SC3)
  - [ ] 비누방울 제거 시 돈과 구별 가능한 "터지는" 시각 피드백 (SC4 — 별도 transition)
  - [ ] 돈이 땅에 닿으면 점수 변화 없이 사라진다 (Scenario 5 SC1)
  - [ ] 비누방울이 땅에 닿으면 점수 변화 없이 사라진다 (SC2)
  - [ ] 놓친 객체에는 별도 페널티 표시가 나타나지 않는다 (SC3)
- **검증**:
  - `bun run test -- lib/spawner lib/score components/game/Drop hooks/useGameLoop`
  - `bun run build`
  - 사용자 수동 플레이로 클릭 반응성·피드백 시각 확인

---

### Task 4: 시간 가속 + 라운드 종료 + 결과 화면

- **담당 시나리오**: Scenario 6 (full), Scenario 7 (full)
- **크기**: M (4 파일)
- **의존성**: Task 3 (낙하·점수 동작)
- **참조**:
  - `shadcn` — Card / Badge 사용
  - `vercel-react-best-practices` — phase 변경 시 cleanup
- **구현 대상**:
  - `lib/spawner.ts` 확장 — `spawnIntervalAt(elapsedSec): number`, `fallSpeedAt(elapsedSec): number`. 선형: `1 + 1.5 * (elapsed/60)`로 빈도·속도 곱한다.
  - `hooks/useGameLoop.ts` 확장 — timeLeftSec 카운트다운, 0 도달 시 phase='result' 전환 + 잔여 drops clear + 통계 누적(`stats`). 노출 추가: `stats`, `finalScore`.
  - `components/game/ResultScreen.tsx` + `.test.tsx` — props: `{ finalScore, stats, isNewBest?, onRestart, onMenu }`. wireframe Screen 3 구조. (`isNewBest`·버튼 동작은 Task 5에서.)
  - `app/page.tsx` — phase=='result' 분기 추가.
- **수용 기준**:
  - [ ] 라운드 0-10초 평균 동시 객체 수 < 50-60초 평균 동시 객체 수 (Scenario 6 SC1)
  - [ ] 객체 화면 상→하 통과 시간이 라운드 후반에 더 짧다 (SC2 — 속도 곱 검증, 유닛)
  - [ ] 가속이 단계적·연속적이며 한 번에 급변하지 않는다 (SC3 — `spawnIntervalAt` 단조 감소·매끄러움 단위 테스트)
  - [ ] 시간 0 도달 → 새 객체 생성 중단 (Scenario 7 SC1)
  - [ ] 시간 0 도달 → 잔여 객체 사라지고 결과 화면 표시 (SC2)
  - [ ] 결과 화면에 최종 점수가 표시된다 (SC3)
  - [ ] 종류별 잡은 개수(동전·지폐·금괴·작은 비누·큰 비누) 5칸이 표시된다 (SC4)
  - [ ] "다시하기" / "메뉴로" 버튼이 표시된다 (SC5 — 버튼 동작은 Task 5)
- **검증**:
  - `bun run test -- lib/spawner hooks/useGameLoop components/game/ResultScreen`
  - `bun run build`

---

### Task 5: 최고 점수 갱신 + 다시하기 + 메뉴 이동

- **담당 시나리오**: Scenario 8 (full), Scenario 9 (full), Scenario 10 (full)
- **크기**: M (3 파일)
- **의존성**: Task 4 (결과 화면)
- **참조**:
  - `next-best-practices` — 클라이언트 상태 초기화 패턴
- **구현 대상**:
  - `hooks/useGameLoop.ts` 확장 — `restart()`, `toMenu()`. restart는 phase→countdown 재진입 + 모든 라운드 상태 초기화(점수 0, 시간 60, drops·stats·boosters·lastBoosterThreshold 0). result 진입 시점에 `useBestScore`의 `recordIfBest` 호출 (`recordIfBest`는 이미 Task 1에서 구현됨 — 훅 연결만 추가).
  - `components/game/ResultScreen.tsx` 확장 — `isNewBest`이면 "★ NEW BEST" Badge 표시. 두 버튼 핸들러 연결.
  - `app/page.tsx` 확장 — `useBestScore().recordIfBest` 연결, `restart()` / `toMenu()` 핸들러 배선.
- **수용 기준**:
  - [ ] 직전 최고점 100, 이번 120 → 결과 화면에 NEW BEST 배지 표시 (Scenario 8 SC1)
  - [ ] 직전 최고점 100, 이번 80 → 배지 미표시 (SC2)
  - [ ] 최고점 없음 + 첫 라운드 양수 → 최고점 기록 + 배지 (SC3)
  - [ ] 결과 → "메뉴로" 클릭 시 메뉴의 최고점이 새 값 (SC4)
  - [ ] 라운드 점수가 음수로 종료 → 최고점에 기록되지 않고 기존 값 유지 (SC5)
  - [ ] 결과 화면에서 "다시하기" 클릭 → 결과 화면이 사라지고 카운트다운 시작 (Scenario 9 SC1)
  - [ ] 새 라운드 시작 시 점수 0, 시간 60으로 초기화 (Scenario 9 SC2)
  - [ ] "메뉴로" 클릭 → 결과가 사라지고 메뉴가 표시된다 (Scenario 10 SC1)
  - [ ] 직전 라운드에서 최고점이 갱신되었다면 메뉴의 최고점 표시가 새 값 (SC2)
- **검증**:
  - `bun run test -- hooks/useGameLoop components/game/ResultScreen app`
  - `bun run build`

---

### Checkpoint B — Task 2-5 이후

- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 메뉴 → 시작 → 60초 라운드 → 결과 → 다시하기 / 메뉴로 한 사이클이 사람이 보고 동작 확인 가능 (Scenarios 1-10 통합)
- [ ] 최고점 영속성 확인 (페이지 새로고침 후에도 유지)

---

### Task 6: 부스터 충전 (200점 임계점)

- **담당 시나리오**: Scenario 11 (full)
- **크기**: M (4 파일)
- **의존성**: Task 5 (라운드 종료·재시작 완성)
- **참조**:
  - `shadcn` — Button(아이콘만) variant
- **구현 대상**:
  - `lib/score.ts` 확장 — `countCrossedThresholds(prevScore: number, nextScore: number, lastThreshold: number, step = 200): { count: number; newLastThreshold: number }`. 양의 방향만 카운트 (음→양 회복 시 0). 한 번에 N개 임계점 넘으면 N 반환.
  - `hooks/useGameLoop.ts` 확장 — 점수 변경 직후 `countCrossedThresholds` 호출, `boosters += count` + `lastBoosterThreshold` 갱신. restart 시 둘 다 0.
  - `components/game/Hud.tsx` 확장 — BOOSTER 카운트 표시. 부스터 버튼(`Zap` 아이콘). `boosters===0`이면 disabled.
- **수용 기준**:
  - [ ] 점수 195 → 동전(+5) 클릭으로 200 도달 → 부스터 보유 +1 (SC1)
  - [ ] 점수 190 → 지폐(+15) 클릭으로 205 도달 → 부스터 보유 +1 (SC2)
  - [ ] 임계점 통과 직후 HUD의 부스터 카운트 표시가 즉시 갱신된다 (SC3 — 같은 프레임)
  - [ ] 점수 210 → 비누방울로 150 감점 → 다시 동전으로 210 회복 → 200 임계점 부스터 재발급 안 됨 (SC4)
  - [ ] 점수 190 → 금괴(+50) 클릭으로 240 도달 → 200 임계점 1회 통과로 부스터 +1 (SC5-a: 단일 클릭이 단일 임계점 통과)
  - [ ] 점수 380 → 첫 번째 클릭 후 399, 두 번째 클릭으로 410 도달 시 400을 처음 넘는 순간 부스터 +1 (SC5-b: 두 번의 클릭 사이에 임계점 처음 통과 — `countCrossedThresholds` 유닛 테스트로 독립 검증)
  - [ ] 새 라운드 시작 시 보유 부스터 0 (SC6)
  - [ ] 음수 점수에서 0~199 구간으로 회복 → 부스터 발급 안 됨 (SC7)
- **검증**:
  - `bun run test -- lib/score hooks/useGameLoop components/game/Hud`
  - `bun run build`

---

### Task 7: 부스터 발동 (3초 모드) + 중첩 방지

- **담당 시나리오**: Scenario 12 (full), Scenario 13 (full)
- **크기**: M (3 파일)
- **의존성**: Task 6 (부스터 충전)
- **참조**:
  - `vercel-react-best-practices` — 타이머 cleanup, 동시 모드 가드
  - `web-design-guidelines` — 모드 활성 시각 강조 (테두리 글로우 등)
- **구현 대상**:
  - `lib/spawner.ts` 확장 — `pickKind`가 `mode` 파라미터 받기 (`'normal' | 'booster'`). booster 모드에서 비누방울 가중치 0, 동전 5·지폐 3·금괴 1.
  - `hooks/useGameLoop.ts` 확장 — `activateBooster()`: 모드 비활성 + boosters>0이면 `boosters -= 1`, `boosterEndsAt = now + 3000`. RAF 루프에서 `boosterEndsAt <= now`면 자동 해제. spawn 호출 시 활성 여부 따라 mode 전달. 모드 활성 중에는 `activateBooster` 호출이 no-op. 라운드 종료(timeLeftSec=0) 시 `boosterEndsAt=null` 강제.
  - `components/game/Hud.tsx` 확장 — `boosterActive`이거나 `boosters===0`이면 버튼 disabled. 활성 시 시각 강조 (예: `data-active`로 ring).
- **수용 기준**:
  - [ ] 보유 2개에서 버튼 클릭 → 보유 1개 + 부스터 모드 진입 시각 강조 표시 (Scenario 12 SC1)
  - [ ] 모드 진입 시각부터 정확히 3000ms 후 자동 종료 (SC2 — fake timer)
  - [ ] 모드 동안 새 비누방울 0개 생성 (SC3)
  - [ ] 모드 동안 동전 spawn 빈도 약 5배 (SC4 — 가중치 5:3:1 확률 기댓값)
  - [ ] 모드 동안 지폐 빈도 약 3배 (SC5)
  - [ ] 모드 동안 금괴 빈도는 평소와 동일 (SC6)
  - [ ] 모드 진입 시점에 이미 화면에 떠 있던 비누방울은 그대로 떨어진다 (SC7 — 강제 제거 없음, 클릭 시 평소대로 감점)
  - [ ] 모드 동안 떨어지는 돈 클릭 시 평소와 동일하게 점수 증가 (SC8)
  - [ ] 모드 종료 직후부터 평소 생성 패턴으로 복귀 (SC9)
  - [ ] 보유 0이면 부스터 버튼 비활성, 클릭해도 발동 안 됨 (SC10)
  - [ ] 모드 활성 중 버튼 재클릭 → 보유·남은 시간 변화 없음 (Scenario 13 SC1)
  - [ ] 모드 활성 중 버튼 비활성 시각 표시, 종료 후 다시 활성 (SC2)
  - [ ] 모드 종료 직후 클릭 → 정상 발동 (보유 -1, 3초 재시작) (SC3)
  - [ ] 라운드 잔여 1초에 부스터 발동 → 라운드 종료 시 모드 자동 종료 (불변 규칙: 부스터)
  - [ ] 부스터 모드 진입 전·진입 중·종료 후, `spawnIntervalAt(t)` 값이 `t` 기준으로 연속적으로 유지된다 — 모드 전환 시 급격한 변화 없음 (불변 규칙: 부스터 4항)
- **검증**:
  - `bun run test -- lib/spawner hooks/useGameLoop components/game/Hud` (vitest fake timers)
  - `bun run build`

---

### Task 8: 시스템 테마 통합 + 반응형·접근성 + E2E

- **담당 시나리오**: 불변 규칙 (시각 식별·클릭 가능성·반응성·반응형·테마·데이터 영속성·부스터)
- **크기**: M (5 파일)
- **의존성**: Task 7 (전체 게임 동작 완성)
- **참조**:
  - `web-design-guidelines` — 클릭 영역 ≥44px, 다크모드 대비, 모바일 세로 검증
  - `next-best-practices` — App Router metadata, 정적 자원
- **구현 대상**:
  - `app/layout.tsx` — `enableSystem={true}` `defaultTheme="system"` (현재 `enableSystem={false}` 수정 필요). metadata 제목/설명을 "Make It Rain — 60초 캐주얼 클릭 게임"으로 변경.
  - `components/game/Drop.tsx` 수정 — 클릭 hitbox padding으로 모든 종류 최소 44×44 보장. 모양·색이 다크/라이트 양쪽에서 식별 가능하도록 semantic token 사용 (`border-foreground`, `bg-card` 등).
  - `components/game/GameBoard.tsx` 수정 — 보드 높이를 viewport 기반으로 (예: `h-[min(70vh,640px)]`). 모바일 세로/데스크톱 가로 모두 정상 동작.
  - `e2e/smoke.spec.ts` 수정 — 기존 smoke를 게임 페이지 진입 + 메뉴 보임 확인으로 갱신.
  - `e2e/game.spec.ts` New — Playwright clock API로 60초 단축. 시나리오: 메뉴 → 시작 → 카운트다운 → 객체 클릭 → 결과 → 다시하기 → 메뉴.
- **수용 기준**:
  - [ ] 모든 객체의 클릭 가능 영역이 최소 44×44 CSS px 이상 (불변 규칙: 클릭 가능성 1)
  - [ ] 두 객체 시각 겹침 시 위에 있는 객체가 우선 클릭 반응 (z-order, Browser MCP 또는 수동)
  - [ ] 모바일 세로(예: 375×667)에서 점수·시간·부스터 HUD 항상 노출 (불변 규칙: 반응형 2)
  - [ ] 데스크톱 가로(예: 1280×800)에서도 동일하게 노출
  - [ ] OS 다크모드 → 메뉴·보드·결과 모두 다크 톤 (불변 규칙: 테마 1)
  - [ ] OS 라이트모드 → 모두 라이트 톤 (테마 2)
  - [ ] 다크·라이트 양쪽에서 돈·비누방울 시각 식별성 유지 (테마 3)
  - [ ] Playwright `e2e/game.spec.ts` 통과 (clock fast-forward로 60초 라운드 진행)
  - [ ] 페이지 새로고침 후 최고점은 유지, 부스터 보유는 0 (불변 규칙: 데이터 영속성 2)
  - [ ] 60초 라운드 동안 사용자가 인지 가능한 프레임 드롭이 없다 (불변 규칙: 반응성 2 — 수동 플레이 확인)
- **검증**:
  - `bun run test`
  - `bun run build`
  - `bun run test:e2e`
  - Browser MCP — `localhost:3000`에서 라이트/다크 OS 설정 토글, 모바일·데스크톱 viewport 캡처. 증거: `artifacts/make-it-rain/evidence/task-8-{light-mobile,light-desktop,dark-mobile,dark-desktop}.png`
  - Browser MCP — z-order 확인: 두 객체를 겹치게 만들어 위에 보이는 객체 클릭 시 해당 객체만 점수 반응하고 뒤 객체는 변화 없음 확인
  - 사용자 수동 플레이 — 60초 전 구간 클릭 반응성·60fps 연속성·가속 곡선 자연스러움 확인 (자동화 불가)

---

### Checkpoint C — Task 6-8 이후 (최종)

- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] E2E 통과: `bun run test:e2e`
- [ ] Spec의 13개 시나리오 + 불변 규칙 모두 사용자가 보고 확인 가능
  - Scenarios 1-10: Checkpoint B에서 확인한 사이클이 유지됨
  - Scenarios 11-13: 부스터 충전 → 발동 → 중첩 방지 한 사이클 수동 플레이 확인
- [ ] `artifacts/make-it-rain/evidence/` 아래 라이트·다크 × 모바일·데스크톱 스크린샷 저장

---

## Verification — Plan 차원

### Spec 시나리오 ↔ Task 매핑

| Scenario | Task | 비고 |
|---|---|---|
| 1. 메뉴 진입 | ✅ Task 1 | full |
| 2. 카운트다운 | Task 2 | full |
| 3. 돈 클릭 득점 | Task 3 | full |
| 4. 비누방울 클릭 감점 | Task 3 | full |
| 5. 객체 땅 도달 | Task 3 | full |
| 6. 시간 가속 | Task 4 | full |
| 7. 라운드 종료/결과 | Task 4 | full |
| 8. 최고점 갱신 | Task 5 | full |
| 9. 다시하기 | Task 5 | full |
| 10. 메뉴로 | Task 5 | full |
| 11. 부스터 충전 | Task 6 | full |
| 12. 부스터 발동 | Task 7 | full |
| 13. 부스터 중첩 방지 | Task 7 | full |
| 불변 규칙 전체 | Task 8 | E2E + Browser MCP + 수동 |

### 위험 & 완화

| 위험 | 완화 |
|---|---|
| RAF 루프 + state 업데이트 빈번 → 리렌더 폭증 | Drop 컴포넌트 `React.memo`, drops 위치는 ref + transform으로 처리 (state는 spawn/제거 시에만) |
| 60초 E2E 비실용 | Playwright `page.clock.fastForward()` 사용 |
| localStorage SSR 접근 오류 | storage 헬퍼에서 `typeof window` 가드, useEffect에서만 호출 |
| 모드 종료 타이밍이 RAF에 묶여 정확도 흔들림 | `boosterEndsAt` 절대 ms 비교, 매 프레임 체크 |
| 사용자가 빠르게 더블 클릭 시 같은 drop이 2번 점수 처리 | 클릭 시 drops 배열에서 즉시 제거(상태 업데이트 한 번에) |

## 미결정 항목

- **객체 종류별 등장 빈도**: 정상 모드 가중치 coin:6, bill:3, gold:1, bubble-s:3, bubble-l:1로 시작. 플레이 테스트 후 Task 4 검증 단계에서 조정 가능
- **점수 값 미세 튜닝**: spec의 5/15/50/-5/-20을 그대로 사용. 빌드 후 체감 조정 필요 시 `config/game.ts`만 수정
- **시각 피드백 강도**: drop 사라질 때 transition 시간(돈=fade+scale-out 150ms / 비누방울=scale-up 200ms 후 fade) — Task 3 구현 단계에서 결정 가능
- **부스터 모드 시각 강조 형태**: 보드 ring / HUD pulse 중 선택 — Task 7에서 wireframe에 없는 영역이라 사용자 확인 후 결정
