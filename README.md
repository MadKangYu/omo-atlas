# OMO Skill Atlas

> Interactive atlas of the OMO / LazyCodex Codex plugin — 23 skills, the ULW (ultrawork) engine, git-master internals, and plugin anatomy on one screen.

**Live:** https://omo-atlas.vercel.app

`@sisyphuslabs/omo-codex-plugin`(설치 패키지 `lazycodex-ai`)의 23개 `SKILL.md`를 직접 정독해 6축으로 재구성하고,
ULW 자율 실행 엔진·git-master 4-Mode·플러그인 내부(컴포넌트·후크·MCP)까지 연결한 단일 페이지 사이트.
"모르는 개념 없도록" 카드/노드/매핑을 누르면 우측 슬라이드오버 상세가 열린다.

## 뷰 5개

| 탭 | 내용 |
|---|---|
| **보드** | 6축 칸반(코드 구조·런타임 디버깅·프론트엔드·작업 루프·LazyCodex 운영·확장 탐색) + 23개 스킬 카드. 축 필터·실시간 검색. |
| **작업 흐름** | 입구→출구 파이프라인(`init-deep → ulw-plan → start-work → programming/frontend → review-work → git-master`), side-loop, 설계 패턴 5, 명령어 매핑. |
| **Git 심화** | 4영역 데이터 흐름, merge vs rebase, git-master **4-Mode Gate**(COMMIT/REBASE/HISTORY/STATUS), HISTORY 도구 선택표, Safety Checks. |
| **ULW 엔진** | ultrawork 루프(ulw-plan→start-work→review), Sisyphus 어휘(Prometheus·Boulder·Evidence Ledger·DoneClaim→AdversarialVerify·Stop-hook 연속), 9 ultraqa 적대검증, 5 검증 게이트, `.omo` 상태파일. |
| **OMO 내부** | 플러그인 v4.13.0, 15 컴포넌트, 21 후크(라이프사이클별), 5 플러그인 MCP, 컴포넌트↔스킬 매핑. |

## 소스-of-truth 빌드 (스냅샷 아님)

스킬 목록·버전·카운트는 **설치된 omo에서 자동 생성**되고, 큐레이션된 서사(ULW Sisyphus 모델·git Mode Gate)만 손으로 작성한다.

```bash
node build-data.mjs   # 설치된 omo 스캔 → data.json (version/skills/components/hooks/mcp) + drift 체크
```

- `data.json` — 생성된 단일 진실원. 사이트가 이걸 읽어 버전 라벨 + **`source-synced ✓` 배지**를 띄움.
- `drift 체크` — 보드 카드 ≠ 라이브 omo 스킬셋이면 FAIL(스킬 추가/삭제/이름변경 감지).

## 무인 자동 갱신

omo가 새 버전으로 업데이트되면 사이트가 알아서 따라간다.

```bash
node auto-update.mjs   # data.json 재생성 → 라이브와 비교 → 변경시에만 git commit + vercel deploy --prod
```

- Aside **cron 루틴**(매일 11:00 KST)이 이 스크립트를 실행한다.
- 변경 없으면 조용히 종료, 버전업이면 재배포 + 알림. 새 스킬 등장(drift)이면 "카드 수기 추가 필요" 알림만.

## 구조

```
index.html       자체완결 단일 페이지 (vanilla JS, 빌드 불필요)
data.json        build-data.mjs가 생성하는 소스-of-truth 데이터
build-data.mjs   설치된 omo → data.json 생성 + drift 체크
auto-update.mjs  무인 재생성·비교·재배포
vercel.json      정적 배포 설정
```

## 배포

```bash
vercel deploy --prod --yes --scope <your-vercel-scope>
```

## 데이터 출처

로컬 캐시 `~/.codex/plugins/cache/sisyphuslabs/omo/<version>/skills/` 의 SKILL.md 정독 기반.
6축 매핑은 작업 흐름 기준 재구성. git-master는 실제 SKILL.md의 4-Mode 구조.
omo 플러그인 원작: [github.com/sisyphuslabs/omo](https://github.com/sisyphuslabs/omo) (MIT).

## License

MIT
