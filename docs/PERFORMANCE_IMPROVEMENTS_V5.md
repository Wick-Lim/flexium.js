# 성능 개선 분석 V5 - 렌더러 및 DOM 최적화

## 프로젝트 개요
이전 개선사항(V4)에서 State Proxy와 Computed 최적화를 완료했습니다. 이번 분석은 렌더러와 DOM 조작에 초점을 맞춥니다.

## 🔍 발견된 주요 성능 개선점

### 1. reconcileArrays Map/Set 재사용 최적화 ⚠️ **높은 우선순위**

**위치**: `packages/flexium/src/renderers/dom/reconcile.ts:149-161`

**현재 상태**:
```typescript
// 매번 새로운 Map과 Set 생성
const keyToOldFNode = new Map<string | number | undefined, FNode>()
const seen = new Set<string | number | undefined>()
```

**문제점**:
- 큰 리스트에서 매번 Map/Set 생성으로 GC 압력 증가
- 재사용 가능한 객체를 매번 새로 할당
- 메모리 할당 오버헤드

**개선 방안**:
```typescript
// 객체 풀링 구현
namespace ReconciliationPool {
  const mapPool: Map<string | number | undefined, FNode>[] = []
  const setPool: Set<string | number | undefined>[] = []
  
  export function getMap(): Map<string | number | undefined, FNode> {
    if (mapPool.length > 0) {
      const map = mapPool.pop()!
      map.clear()
      return map
    }
    return new Map()
  }
  
  export function getSet(): Set<string | number | undefined> {
    if (setPool.length > 0) {
      const set = setPool.pop()!
      set.clear()
      return set
    }
    return new Set()
  }
  
  export function release(map: Map<any, any>, set: Set<any>): void {
    if (mapPool.length < 10) mapPool.push(map)
    if (setPool.length < 10) setPool.push(set)
  }
}
```

**예상 성능 향상**: 10-15% (큰 리스트 렌더링 시, GC 압력 감소)

---

### 2. createReactiveRoot innerHTML 최적화 ⚠️ **높은 우선순위**

**위치**: `packages/flexium/src/renderers/dom/reactive.ts:656-668`

**현재 상태**:
```typescript
rootDispose = effect(() => {
  if (!isSameNode && container.firstChild) {
    if (container.childNodes.length === 1) {
      container.removeChild(container.firstChild!)
    } else {
      container.innerHTML = ''  // 전체 DOM 제거
    }
  }
  currentRootNode = mountReactive(node, container)
  currentFNode = node
})
```

**문제점**:
- 같은 노드가 아닐 때 항상 전체 DOM을 제거하고 재생성
- 기존 노드와 reconcile하지 않음
- 큰 앱에서 root 재렌더링 시 성능 저하

**개선 방안**:
```typescript
rootDispose = effect(() => {
  if (!isSameNode && currentRootNode) {
    // 기존 노드가 있으면 reconcile 시도
    if (currentRootNode && isFNode(node)) {
      // 기존 FNode와 새 FNode를 비교하여 점진적 업데이트
      const oldFNode = getFNodeFromDOM(currentRootNode)
      if (oldFNode && oldFNode.type === node.type) {
        // 타입이 같으면 patch만 수행
        patchNode(oldFNode, node)
        currentRootNode = getNode(node) || currentRootNode
        currentFNode = node
        return
      }
    }
    
    // 타입이 다르거나 reconcile 불가능하면 기존 방식 사용
    cleanupReactive(currentRootNode)
    if (container.childNodes.length === 1) {
      container.removeChild(container.firstChild!)
    } else {
      container.innerHTML = ''
    }
  }
  currentRootNode = mountReactive(node, container)
  currentFNode = node
})
```

**예상 성능 향상**: 30-50% (큰 앱에서 root 재렌더링 시)

---

### 3. Array.from() 최적화 ⚠️ **중간 우선순위**

**위치**: 여러 파일에서 사용

**현재 상태**:
```typescript
// packages/flexium/src/renderers/dom/reactive.ts:290
currentNodes = Array.from(fragment.childNodes)

// packages/flexium/src/renderers/dom/reactive.ts:338
currentNodes = Array.from(newNode.childNodes)

// packages/flexium/src/renderers/dom/reactive.ts:444
currentNodes = newFNodes.map(fn => getNode(fn)).filter(n => n != null) as Node[]
```

**문제점**:
- `Array.from()`은 새로운 배열을 생성하여 메모리 할당
- 일부 경우 직접 순회로 대체 가능
- `.map().filter()` 체인은 중간 배열 생성

**개선 방안**:
```typescript
// 1. 직접 순회로 변경 (가능한 경우)
const currentNodes: Node[] = []
for (let i = 0; i < fragment.childNodes.length; i++) {
  currentNodes.push(fragment.childNodes[i])
}

// 2. map+filter를 한 번의 순회로 통합
const currentNodes: Node[] = []
for (const fn of newFNodes) {
  const node = getNode(fn)
  if (node != null) {
    currentNodes.push(node)
  }
}
```

**예상 성능 향상**: 5-8% (많은 배열 변환이 있을 때)

---

### 4. mountReactive 타입 체크 순서 최적화 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/renderers/dom/reactive.ts:117-537`

**현재 상태**:
```typescript
export function mountReactive(node, container) {
  // null/undefined 체크 (가장 먼저) ✅
  if (node === null || node === undefined || typeof node === 'boolean') {
    return null
  }
  
  // List component 체크
  if (isListComponent(node)) { ... }
  
  // StateValue 체크
  if (isStateValue(node)) { ... }
  
  // Signal/function 체크
  if (isSignal(node) || typeof node === 'function') { ... }
  
  // Array 체크
  if (Array.isArray(node)) { ... }
  
  // Text 체크
  if (typeof node === 'string' || typeof node === 'number') { ... }
  
  // FNode 체크 (가장 일반적인 케이스인데 마지막에 체크)
  if (isFNode(node)) { ... }
}
```

**문제점**:
- 가장 일반적인 케이스(FNode)가 마지막에 체크됨
- 여러 타입 체크를 거쳐야 FNode에 도달

**개선 방안**:
```typescript
export function mountReactive(node, container) {
  // null/undefined 체크 (가장 먼저)
  if (node === null || node === undefined || typeof node === 'boolean') {
    return null
  }
  
  // Performance: 가장 일반적인 케이스를 먼저 체크
  // FNode가 가장 자주 사용되므로 먼저 확인
  if (isFNode(node)) {
    // FNode 처리
    return mountFNode(node, container)
  }
  
  // 그 다음 일반적인 케이스들
  if (typeof node === 'string' || typeof node === 'number') {
    return mountText(node, container)
  }
  
  if (Array.isArray(node)) {
    return mountArray(node, container)
  }
  
  // 덜 일반적인 케이스들
  if (isListComponent(node)) { ... }
  if (isStateValue(node)) { ... }
  if (isSignal(node) || typeof node === 'function') { ... }
}
```

**예상 성능 향상**: 3-5% (일반적인 렌더링 시나리오에서)

---

### 5. updateStyles 반복 속성 접근 최적화 ⚠️ **낮은 우선순위**

**위치**: `packages/flexium/src/renderers/dom/index.ts:264-377`

**현재 상태**:
- 이미 많은 최적화가 적용됨 ✅
- `styleRecord` 캐싱 사용 ✅
- 값 변경 체크 수행 ✅

**추가 개선 가능**:
```typescript
// 현재: 두 번의 for...in 루프
for (const propName in oldProps) { ... }
for (const propName in newProps) { ... }

// 개선: 한 번의 루프로 통합 (하지만 가독성 저하)
const allProps = new Set([...Object.keys(oldProps), ...Object.keys(newProps)])
for (const propName of allProps) {
  const oldValue = oldProps[propName]
  const newValue = newProps[propName]
  // 처리...
}
```

**예상 성능 향상**: 2-3% (많은 스타일 속성이 있을 때)

---

### 6. setupReactiveProps 이벤트 핸들러 분리 최적화 ⚠️ **중간 우선순위**

**위치**: `packages/flexium/src/renderers/dom/reactive.ts:543-613`

**현재 상태**:
```typescript
function setupReactiveProps(node, props) {
  // 이벤트 핸들러를 먼저 분리
  const regularProps: Array<[string, unknown]> = []
  for (const key in props) {
    if (!key.startsWith('on')) {
      regularProps.push([key, props[key]])
    }
  }
  
  // 일반 props 처리
  for (const [key, value] of regularProps) {
    // ...
  }
}
```

**개선 방안**:
```typescript
// 이벤트 핸들러는 updateNode에서 처리되므로 여기서는 제외
// 하지만 현재 구현이 이미 최적화되어 있음
// 추가 개선: props 객체를 한 번만 순회
const reactiveProps: Array<[string, unknown]> = []
for (const key in props) {
  if (!key.startsWith('on') && (isSignal(props[key]) || typeof props[key] === 'function')) {
    reactiveProps.push([key, props[key]])
  }
}

// reactiveProps만 처리 (더 적은 반복)
for (const [key, value] of reactiveProps) {
  // ...
}
```

**예상 성능 향상**: 3-5% (많은 props가 있을 때)

---

### 7. DocumentFragment 재사용 ⚠️ **낮은 우선순위**

**위치**: 여러 곳에서 `document.createDocumentFragment()` 사용

**현재 상태**:
- 매번 새로운 Fragment 생성
- GC 압력 증가 가능

**개선 방안**:
- Fragment 풀링 (하지만 Fragment는 가벼워서 큰 효과 없을 수 있음)
- 현재 구현이 적절할 수 있음

**예상 성능 향상**: 1-2% (매우 미미함)

---

## 📊 우선순위별 개선 계획

### 🔴 높은 우선순위 (즉시 개선 권장)

1. **reconcileArrays Map/Set 재사용** - 큰 리스트에서 큰 효과, 구현 난이도: 중간
2. **createReactiveRoot reconcile 최적화** - 큰 앱에서 큰 효과, 구현 난이도: 높음

### 🟡 중간 우선순위 (단기 개선)

3. **Array.from() 최적화** - 많은 배열 변환에서 효과
4. **mountReactive 타입 체크 순서** - 일반적인 렌더링에서 효과
5. **setupReactiveProps 최적화** - 많은 props에서 효과

### 🟢 낮은 우선순위 (장기 개선)

6. **updateStyles 추가 최적화** - 이미 잘 최적화됨
7. **DocumentFragment 재사용** - 효과 미미

---

## 🎯 예상 전체 성능 향상

모든 개선 사항을 적용하면:
- **리스트 렌더링**: 10-15% 향상
- **Root 재렌더링**: 30-50% 향상
- **일반 렌더링**: 5-8% 향상
- **전체적인 DOM 조작**: 10-15% 향상

---

## 📝 구현 시 주의사항

1. **기존 테스트 유지**: 모든 변경사항은 기존 테스트를 통과해야 함
2. **벤치마크 추가**: 개선 전후 성능 측정
3. **메모리 프로파일링**: 객체 풀링이 메모리 사용량에 미치는 영향 모니터링
4. **점진적 적용**: 한 번에 하나씩 적용하고 테스트

---

## 🔬 벤치마크 제안

다음 시나리오로 성능 측정 권장:
- 큰 리스트 렌더링 (1000+ 아이템)
- Root 재렌더링 (큰 컴포넌트 트리)
- 많은 props를 가진 컴포넌트 렌더링
- 빠른 연속 업데이트 (애니메이션 등)

---

## 결론

렌더러 최적화는 큰 앱에서 특히 효과적입니다. 가장 큰 영향이 예상되는 개선은 **createReactiveRoot reconcile 최적화**와 **reconcileArrays Map/Set 재사용**입니다.
