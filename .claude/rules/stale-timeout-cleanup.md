# 규칙: setTimeout + phase 전환 시 stale 콜백 방지

## 맥락

React 훅에서 애니메이션 딜레이를 위해 `setTimeout`을 사용하고, 그 콜백이 컴포넌트나 훅의 state를 변경할 때, 타이머가 실행되기 전에 phase(또는 step)가 전환되면 stale한 state mutation이 발생한다.

## 규칙

**`setTimeout` 콜백이 ref나 setState를 호출하는 경우, 반드시 cleanup 메커니즘을 제공해야 한다.**

1. 타이머 ID를 `ref` 배열에 보관한다
2. phase 전환 또는 reset 시 모든 타이머를 일괄 취소한다

## 패턴

```typescript
const pendingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

function scheduleRemoval(id: string, delay: number) {
  const t = setTimeout(() => {
    // state mutation
  }, delay);
  pendingTimeoutsRef.current.push(t);
}

function resetPhase() {
  for (const t of pendingTimeoutsRef.current) clearTimeout(t);
  pendingTimeoutsRef.current = [];
  // ... other reset
}
```

## 적용 대상

- 게임 루프에서 dying 애니메이션 후 객체 제거
- 모달/팝업 닫힘 애니메이션 후 DOM 정리
- 다단계 wizard에서 transition animation 후 phase 전환

## 발견 출처

`artifacts/make-it-rain/learnings.md` — onClickDrop의 dying drop 제거 timeout
