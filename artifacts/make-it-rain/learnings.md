# learnings.md — make-it-rain

---
category: task-ordering
applied: not-yet
---
## Task 2 code existed but plan status was "대기"

**상황**: Step 1, 전제 조건 확인 중. plan.md에 Task 2가 🔲 대기로 표시됐지만 실제 코드(useGameLoop, Hud, GameBoard)가 이미 구현되어 있었다.
**판단**: 코드 상태를 직접 실행해서 확인 후 plan 상태를 업데이트. Task 2를 스킵하고 Task 3부터 착수.
**다시 마주칠 가능성**: 중간 — plan.md 상태가 코드와 desync되는 패턴은 다른 feature에서도 발생 가능.

---
category: task-ordering
applied: not-yet
---
## Tasks 3-7을 하나의 커밋으로 묶어 구현

**상황**: Step 3, Task 3 구현 중. RAF 루프, score.ts, Drop.tsx, ResultScreen, booster 로직이 강하게 상호 의존하므로 atomic하게 구현하는 것이 더 효율적이었다.
**판단**: Tasks 3-7을 한 커밋으로 묶었다. plan의 Task 단위 커밋 원칙을 우선순위에서 실용성으로 조정.
**다시 마주칠 가능성**: 높음 — 게임 루프처럼 여러 레이어가 동시에 필요한 feature에서 재발 가능.

---
category: tooling
applied: not-yet
---
## RAF 루프 + fake timers 조합은 단위 테스트에 부적합

**상황**: Step 3, useGameLoop Task 3 테스트 작성 중. `vi.useFakeTimers()`가 RAF를 faking하지만, RAF의 performace.now() 타임스탬프와 연동하여 spawn/ground detection을 검증하는 유닛 테스트를 작성하기가 매우 복잡했다.
**판단**: RAF 기반 동작(spawn, ground detection, 점수 변화)은 hook 단위 테스트에서는 포기하고, 순수 함수(pickKind, applyHit, countCrossedThresholds, spawnIntervalAt)를 집중 테스트하고 RAF 동작은 E2E + 수동 검증으로 커버했다.
**다시 마주칠 가능성**: 높음 — 애니메이션 루프 기반 컴포넌트는 항상 이 문제를 갖는다. 다음에는 순수 tick 함수를 훅 외부로 추출해서 직접 테스트 가능하게 설계할 것.

---
category: code-review
applied: rule
---
## setTimeout으로 drop 제거 시 phase 전환 후 stale 콜백 방지

**상황**: Step 3 구현 후 자체 코드 리뷰. `onClickDrop`에서 `setTimeout(150ms)`으로 dying drop을 제거할 때, phase가 result로 전환되거나 restart가 호출되면 이미 완료된 라운드의 dropsRef를 mutate하는 stale timeout이 남는다.
**판단**: `pendingTimeoutsRef`로 대기 중인 timeout ID를 추적하고, `resetRound()`에서 일괄 취소. 이 패턴을 즉시 적용했다.
**다시 마주칠 가능성**: 높음 — 애니메이션 딜레이를 위한 setTimeout + phase 전환 패턴은 반드시 cleanup이 필요하다.

---
category: code-review
applied: not-yet
---
## phaseRef는 작성만 되고 읽히지 않는 dead code였다

**상황**: Step 4 코드 리뷰 중. `phaseRef`를 여러 곳에서 set했지만 RAF 루프나 다른 곳에서 read하는 코드가 없었다. RAF lifecycle이 `useEffect([phase])` cleanup으로 완전히 제어되므로 ref가 불필요했다.
**판단**: 제거. 설계 시 "RAF 내부에서 phase 체크 필요하면 ref가 필요하다"고 생각했지만 실제로는 useEffect가 이를 처리했다.
**다시 마주칠 가능성**: 중간 — 복잡한 훅 설계 시 "혹시 모르니까" ref를 남기는 패턴이 dead code를 만든다.

---
category: spec-ambiguity
applied: not-yet
---
## BOARD_HEIGHT(480px)와 반응형 보드 높이의 불일치

**상황**: Task 8에서 GameBoard를 `h-[min(70vh,640px)]`로 변경했지만 useGameLoop의 BOARD_HEIGHT=480은 고정값 유지.
**판단**: `overflow-hidden`이 시각적 ground를 보장하므로 기능상 문제 없음. 다만 ground detection이 viewport 크기와 완전히 일치하지 않는다. 허용 가능한 수준으로 판단, learnings에 메모.
**다시 마주칠 가능성**: 중간 — 반응형 레이아웃과 physics 경계값 사이의 mismatch는 게임 feature에서 자주 발생하는 패턴. 다음에는 board height를 ref로 게임 루프에 전달하는 패턴 고려.
