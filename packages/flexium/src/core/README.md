# Core 모듈 독립 개발 가이드

각 파일은 독립적으로 개발 가능하도록 설계되었습니다. 각 엔지니어는 자신이 담당하는 파일만 보고 개발할 수 있습니다.

## 개발 순서 (의존성 순서)

### 1단계: 기초 레이어 (독립 개발 가능)

#### **graph.ts** - 의존성 그래프 데이터 구조
- **의존성**: 없음 ✅
- **역할**: Link, ISubscriber, IObservable 인터페이스 정의, Graph.connect/disconnect
- **개발 시 알아야 할 것**: 없음 (완전 독립)

#### **owner.ts** - 스코프 관리
- **의존성**: 없음 ✅
- **역할**: Owner 스코프, cleanup, context 관리
- **개발 시 알아야 할 것**: 없음 (완전 독립)

#### **errors.ts** - 에러 시스템
- **의존성**: 없음 ✅
- **역할**: 에러 코드, 로깅 함수
- **개발 시 알아야 할 것**: 없음 (완전 독립)

### 2단계: 중간 레이어

#### **sync.ts** - 배칭 & 알림
- **의존성**: `graph.ts` (타입만)
- **필요한 인터페이스**:
  ```typescript
  ISubscriber, IObservable, NodeType (from graph.ts)
  ```
- **역할**: 배칭 시스템, notifySubscribers()
- **개발 시 알아야 할 것**: graph.ts의 ISubscriber, IObservable 인터페이스만 알면 됨

#### **proxy.ts** - Proxy 기반 반응성
- **의존성**: `graph.ts`, `sync.ts`
- **필요한 인터페이스**:
  ```typescript
  // from graph.ts
  Graph.connect(), ISubscriber, IObservable, SubscriberFlags, NodeType
  
  // from sync.ts
  notifySubscribers(observable: IObservable)
  ```
- **역할**: Proxy 구현, activeEffect 관리, 의존성 추적
- **개발 시 알아야 할 것**: 
  - graph.ts의 Graph.connect() 사용법
  - sync.ts의 notifySubscribers() 사용법

### 3단계: 상위 레이어

#### **effect.ts** - Effect 시스템
- **의존성**: `errors.ts`, `graph.ts`, `owner.ts`, `proxy.ts`
- **필요한 인터페이스**:
  ```typescript
  // from errors.ts
  ErrorCodes, logError, logWarning
  
  // from graph.ts
  Graph.disconnectDependencies(), ISubscriber, Link, SubscriberFlags, NodeType
  
  // from owner.ts
  Owner, getOwner(), setOwner()
  
  // from proxy.ts
  getActiveEffect(), setActiveEffect()
  ```
- **역할**: EffectNode 클래스, effect() 함수, onCleanup()
- **개발 시 알아야 할 것**: 위 인터페이스들의 사용법만 알면 됨

#### **registry.ts** - 전역 레지스트리
- **의존성**: `state.ts` (타입만)
- **필요한 인터페이스**:
  ```typescript
  // from state.ts (type only)
  StateValue, StateAction, AsyncStatus
  ```
- **역할**: 전역 상태 레지스트리, Key 직렬화
- **개발 시 알아야 할 것**: state.ts의 타입 정의만 알면 됨

#### **component.ts** - Hook 시스템
- **의존성**: 없음 ✅
- **역할**: 컴포넌트 인스턴스, Hook 관리
- **개발 시 알아야 할 것**: 없음 (완전 독립)

### 4단계: 최상위 레이어

#### **state.ts** - State API
- **의존성**: `proxy.ts`, `component.ts`, `registry.ts`, `effect.ts`
- **필요한 인터페이스**:
  ```typescript
  // from proxy.ts
  createSignalProxy(), createComputedProxy(), getProxyFromStateValue(), STATE_SIGNAL
  
  // from component.ts
  getCurrentComponent(), setCurrentComponent()
  
  // from registry.ts
  globalStateRegistry, serializeKey()
  
  // from effect.ts
  effect()
  ```
- **역할**: state() 함수, createResource(), 타입 체크
- **개발 시 알아야 할 것**: 위 인터페이스들의 사용법만 알면 됨

## 개발 워크플로우

### 예시: proxy.ts 개발자

1. **필요한 정보 확인**
   - graph.ts의 `Graph.connect()` 시그니처 확인
   - sync.ts의 `notifySubscribers()` 시그니처 확인
   - 이 두 함수의 인터페이스만 알면 개발 가능

2. **개발**
   - Proxy 구현에 집중
   - activeEffect 관리 로직 구현
   - Graph.connect()와 notifySubscribers()만 호출하면 됨

3. **테스트**
   - graph.ts와 sync.ts의 인터페이스가 변경되지 않으면 독립적으로 테스트 가능

### 예시: effect.ts 개발자

1. **필요한 정보 확인**
   - proxy.ts의 `getActiveEffect()`, `setActiveEffect()` 시그니처 확인
   - owner.ts의 `getOwner()`, `setOwner()` 시그니처 확인
   - graph.ts의 `Graph.disconnectDependencies()` 시그니처 확인
   - errors.ts의 `logError()`, `logWarning()` 시그니처 확인

2. **개발**
   - EffectNode 클래스 구현에 집중
   - 위 인터페이스들만 사용하면 됨

3. **테스트**
   - 위 인터페이스들이 변경되지 않으면 독립적으로 테스트 가능

## 인터페이스 변경 시

- **인터페이스 변경 시**: 해당 인터페이스를 사용하는 모든 파일의 개발자에게 알림 필요
- **구현 변경 시**: 인터페이스가 유지되면 다른 파일에 영향 없음

## 결론

✅ **각 파일은 독립적으로 개발 가능합니다**

각 엔지니어는:
1. 자신이 담당하는 파일의 역할을 이해
2. 필요한 다른 파일의 **인터페이스만** 확인
3. 인터페이스를 사용하여 개발
4. 인터페이스가 변경되지 않으면 독립적으로 테스트 가능

