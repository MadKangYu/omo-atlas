# OMO Skill Atlas

OMO / LazyCodex의 Codex 스킬 스택을 한눈에 보는 인터랙티브 아틀라스.
`@sisyphuslabs/omo-codex-plugin` v4.13.0의 23개 `SKILL.md`를 직접 정독해 6축으로 재구성하고,
Git 개념·git-master 해부·로컬 환경 셋업까지 연결했다.

**라이브:** https://omo-atlas.vercel.app

## 뷰 구성

| 뷰 | 내용 |
|---|---|
| **보드** | 6축 칸반(코드 구조·런타임 디버깅·프론트엔드·작업 루프·LazyCodex 운영·확장 탐색) + 23개 스킬 카드. 축 필터·실시간 검색. |
| **작업 흐름** | 입구→출구 파이프라인(`init-deep → ulw-plan → start-work → programming/frontend → review-work → git-master`), side-loop, 설계 패턴 5, 명령어 매핑. |
| **Git 심화** | 4영역 데이터 흐름, merge vs rebase, git-master 4-Mode Gate(COMMIT/REBASE/HISTORY/STATUS), HISTORY 도구 선택표, Safety Checks. |
| **환경** | `~/.codex` 폴더트리, `config.toml` 핵심 설정, LazyCodex·omo 툴체인(15 컴포넌트·21 후크·5 MCP), 컴포넌트↔스킬 매핑. |

카드/노드/매핑 칩을 누르면 우측 슬라이드오버 상세(무엇인가·Trigger·Anti·핵심 메커니즘·호출·연결된 스킬)가 열린다.

## 구조

- `index.html` — 자체완결 단일 페이지(빌드 불필요, vanilla JS).
- `vercel.json` — 정적 배포 설정.

## 데이터 출처

로컬 캐시 `~/.codex/plugins/cache/sisyphuslabs/omo/4.13.0/skills/` 의 SKILL.md 정독 기반.
6축 매핑은 작업 흐름 기준 재구성. git-master는 실제 SKILL.md의 4-Mode 구조.

## 배포

```bash
vercel deploy --prod --yes --scope richardowen7212-9804s-projects
```
