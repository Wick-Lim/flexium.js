# Publishing Guide for Flexium

이 가이드는 Flexium과 create-flexium을 npm에 배포하는 방법을 안내합니다.

## 배포 전 체크리스트

### ✅ 완료된 항목

- [x] 빌드 성공
- [x] 테스트 통과
- [x] create-flexium CLI 준비
- [x] .gitignore 설정
- [x] .npmignore 설정
- [x] 문서 작성 완료

### ⚠️ 배포 전 필수 작업

- [ ] npm 계정 로그인
- [ ] GitHub 저장소 URL 업데이트 (Wick-Lim 변경)
- [ ] 패키지 이름 확인 (npm에서 사용 가능한지)

---

## 1단계: GitHub URL 업데이트

`package.json`과 `packages/create-flexium/package.json`에서 `Wick-Lim`을 실제 GitHub username으로 변경하세요.

```bash
# 모든 Wick-Lim을 한번에 변경
# macOS/Linux
find . -name "package.json" -not -path "./node_modules/*" -exec sed -i '' 's/Wick-Lim/YOUR_GITHUB_USERNAME/g' {} +

# 또는 수동으로 변경:
# 1. package.json
# 2. packages/create-flexium/package.json
# 3. README.md 등의 문서
```

---

## 2단계: npm 로그인

```bash
# npm 계정 로그인
npm login

# 로그인 확인
npm whoami
```

로그인 시 입력 사항:
- Username
- Password
- Email
- OTP (2FA 설정된 경우)

---

## 3단계: 패키지 이름 확인

```bash
# flexium 패키지 이름 사용 가능 여부 확인
npm view flexium

# 만약 이미 존재한다면 다른 이름 사용 (예: @username/flexium)
```

패키지 이름이 이미 사용 중이라면 `package.json`에서 이름 변경:
```json
{
  "name": "@your-username/flexium"
}
```

---

## 4단계: Flexium 메인 패키지 배포

### Dry Run 테스트 (권장)

```bash
# 배포할 파일 목록 확인
npm publish --dry-run

# 확인할 항목:
# - dist/ 폴더 포함 여부
# - README.md, LICENSE 포함 여부
# - node_modules, test 파일 제외 여부
```

### 실제 배포

```bash
# 배포 (public 접근)
npm publish --access public

# 성공 메시지 확인:
# + flexium@0.4.0
```

배포가 성공하면:
- https://www.npmjs.com/package/flexium 에서 확인 가능
- 누구나 `npm install flexium` 사용 가능

---

## 5단계: create-flexium 패키지 배포

```bash
# create-flexium 디렉토리로 이동
cd packages/create-flexium

# Dry run 테스트
npm publish --dry-run

# 실제 배포
npm publish --access public

# 성공 메시지 확인:
# + create-flexium@0.4.0
```

배포가 성공하면:
- https://www.npmjs.com/package/create-flexium 에서 확인 가능
- 누구나 `npm create flexium@latest` 사용 가능

---

## 6단계: 배포 확인

```bash
# 새 디렉토리에서 설치 테스트
cd /tmp
npm create flexium@latest test-app

# 설치 확인
cd test-app
npm install
npm run dev
```

---

## 버전 업데이트 및 재배포

### Patch 버전 (0.1.0 → 0.1.1)

```bash
npm version patch
npm publish
```

### Minor 버전 (0.1.0 → 0.2.0)

```bash
npm version minor
npm publish
```

### Major 버전 (0.1.0 → 1.0.0)

```bash
npm version major
npm publish
```

또는 `package.json`에 있는 스크립트 사용:
```bash
npm run release        # patch
npm run release:minor  # minor
npm run release:major  # major
```

---

## 트러블슈팅

### 오류: 패키지 이름이 이미 존재합니다

```bash
# 다른 이름으로 변경
# package.json에서 name을 변경:
{
  "name": "@your-username/flexium"
}
```

### 오류: 로그인이 필요합니다

```bash
npm login
```

### 오류: 2FA 코드 필요

```bash
# npm 웹사이트에서 2FA 설정
# 배포 시 OTP 코드 입력
npm publish --otp=123456
```

### 배포 취소 (24시간 이내만 가능)

```bash
# 특정 버전 삭제
npm unpublish flexium@0.4.0

# ⚠️ 경고: 72시간 동안 같은 버전 재배포 불가
```

---

## 배포 후 확인 사항

- [ ] npmjs.com에서 패키지 페이지 확인
- [ ] README가 올바르게 표시되는지 확인
- [ ] 설치 테스트: `npm install flexium`
- [ ] create 테스트: `npm create flexium@latest`
- [ ] GitHub 저장소에 릴리스 태그 생성
- [ ] CHANGELOG.md 업데이트

---

## 보안 및 Best Practices

### .npmignore 확인

다음 파일들이 배포에서 제외되었는지 확인:
- src/ (소스 코드)
- examples/
- .claude/
- test 파일들
- .git/
- .github/
- *.config.ts (개발용 설정)

### package.json의 files 필드

배포에 포함될 파일만 명시:
```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### prepublishOnly 스크립트

배포 전 자동으로 빌드 및 테스트:
```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm test"
  }
}
```

---

## 빠른 참조

```bash
# 전체 배포 프로세스 (한번에)
npm login
npm publish --access public
cd packages/create-flexium
npm publish --access public
cd ../..

# 확인
npm view flexium
npm view create-flexium
```

---

## 참고 링크

- [npm 공식 문서 - Publishing packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm Badge 생성기](https://shields.io/)

---

**배포 준비 완료!** 🚀

위 단계를 따라 배포하시면 됩니다.
