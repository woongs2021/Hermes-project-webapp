# 왜 Hermes로 구현하는가 — Harness 관점의 프로젝트 설명 후보

상태: 7월 계획 전용. 아직 프로덕션 구현 없음.  
작성일: 2026-07-26  
용도: 향후 Hermes/OBD 웹앱의 프로젝트 소개, About 섹션, `/graph` 또는 홈 설명 카드에 반영할 수 있는 설명 후보.

## 핵심 결론

이 루프는 Hermes 없이도 구현 가능하다. LangGraph, CrewAI, OpenAI Agents SDK, cron, Slack/Telegram API, DB, 자체 Python/Node backend를 조합하면 비슷한 구조를 만들 수 있다.

하지만 이 프로젝트에서는 Hermes를 선택하는 것이 자연스럽다. 이유는 Hermes가 단순 챗봇이 아니라 Chris의 에이전트 팀을 운영하기 위한 **하네스(Harness)** 역할을 이미 제공하기 때문이다.

## Hermes 없이 구현하려면 필요한 것

Hermes를 쓰지 않는다면 다음 구성요소를 직접 조립해야 한다.

1. **Scheduler**
   - 매일/매주 루프 실행
   - cron, GitHub Actions, Airflow, Prefect, Dagster, n8n 등

2. **Agent execution layer**
   - Yuna, Go Youn-jung, Son, Faker, Muyeol 같은 역할 에이전트 실행
   - OpenAI/Anthropic/Gemini API 직접 호출
   - LangGraph, CrewAI, AutoGen, OpenAI Agents SDK 등

3. **Orchestrator**
   - Karina처럼 요청을 분류하고 specialist에게 라우팅하는 조율자
   - handoff, retry, failure, final synthesis 처리

4. **Storage / Memory**
   - Markdown, JSONL, SQLite, Postgres, Notion, S3, Supabase, Neo4j, KuzuDB 등
   - daily logs, research items, growth questions, artifacts, decisions, validation notes 저장

5. **Messaging**
   - Telegram Bot API
   - Slack Bot API
   - Discord/email/webhook
   - 발송 실패, 재시도, 채널 분리 처리

6. **Graph layer**
   - `nodes.jsonl`
   - `edges.jsonl`
   - `schema.md`
   - 필요 시 KuzuDB 또는 Neo4j

7. **Governance**
   - 공개/비공개 분리
   - raw log/token/private ID 차단
   - validation status
   - risk flags
   - 승인 전 구현 금지 같은 운영 규칙

## Hermes가 이미 제공하는 것

Hermes는 위 요소 중 많은 부분을 이미 운영 가능한 형태로 제공한다.

- **Profiles**: Karina, Yuna, Go Youn-jung, Son, Faker, Muyeol 같은 독립 역할을 분리해 운영할 수 있다.
- **Gateway**: Telegram/Slack 등 메시징 채널과 연결된다.
- **Cron jobs**: 매일/매주 반복 루프를 실행할 수 있다.
- **Tools**: file, terminal, web, session_search, messaging 등 실질 작업 도구를 제공한다.
- **Memory**: 사용자 선호와 안정적 운영 지식을 기억한다.
- **Skills**: 반복되는 작업 절차를 문서화하고 재사용할 수 있다.
- **Session search**: 과거 대화와 작업 맥락을 다시 찾을 수 있다.
- **Local file workflow**: Markdown/JSONL 기반 루프 기록과 산출물을 쌓기 쉽다.
- **Orchestration pattern**: Karina를 front door로 두고 specialist agent에게 분배하는 구조와 잘 맞는다.

## 프로젝트 소개용 요약 문장 후보

> 이 프로젝트는 Hermes 위에서 구현된다. 이유는 Hermes가 단순한 LLM 채팅 도구가 아니라, Chris의 에이전트 팀을 실행하고 연결하는 하네스이기 때문이다. Telegram/Slack, cron, profile, memory, skill, file workflow가 이미 결합되어 있어, 우리는 인프라를 새로 조립하기보다 Harness 위에서 Loop와 Graph Engineering을 설계할 수 있다.

더 짧은 버전:

> Hermes는 이 프로젝트의 하네스다. 에이전트 팀, 도구, 스케줄, 메시징, 기억, 작업 로그를 하나로 묶어주기 때문에 Chris는 별도 인프라를 처음부터 만들지 않고 Loop와 Graph Engineering 설계에 집중할 수 있다.

## Harness / Loop / Graph Engineering 안에서의 위치

### Harness

Hermes가 담당하는 부분이다.

- 에이전트 프로필
- 도구 실행
- 메시징 연결
- 스케줄러
- 메모리와 스킬
- 파일 기반 산출물
- 오케스트레이션 규칙

### Loop

Hermes 위에서 반복 실행되는 작업 리듬이다.

- Yuna research loop
- Go Youn-jung design/visual loop
- Son growth/SNS loop
- Faker webapp planning loop
- Muyeol validation loop
- Karina final synthesis loop

### Graph Engineering

Hermes 루프에서 나온 산출물을 관계형 지식 구조로 바꾸는 다음 단계다.

- `Agent`
- `ResearchItem`
- `Insight`
- `GrowthQuestion`
- `Artifact`
- `Decision`
- `RiskReview`
- `Theme`

관계 예시:

```text
ResearchItem → Insight → GrowthQuestion → RiskReview → Decision → Artifact
```

## 웹앱 반영 후보

### 홈 섹션

제목 후보:

- 왜 Hermes인가
- Why Hermes
- Hermes as Harness
- 하네스로서의 Hermes

카드 구성 후보:

1. **직접 만들 수도 있었다**
   - LangGraph, CrewAI, cron, Slack API, DB를 조합하면 가능하다.

2. **하지만 Hermes가 하네스 역할을 한다**
   - profile, cron, gateway, memory, skill, tools가 이미 결합되어 있다.

3. **그래서 우리는 Loop와 Graph Engineering에 집중한다**
   - 인프라 조립보다 Chris의 사고 운영 구조를 설계하는 데 집중한다.

### `/graph` 또는 `/about` 섹션

표현 후보:

```text
Without Hermes:
Scheduler + Agent Framework + Messaging + Storage + Memory + Governance를 직접 조립해야 한다.

With Hermes:
이 기반이 이미 하네스로 제공되기 때문에, 프로젝트는 Loop 설계와 Graph Engineering으로 바로 이동할 수 있다.
```

## 주의할 점

- Hermes가 유일한 방법이라고 말하지 않는다.
- “Hermes 없이는 불가능하다”라고 과장하지 않는다.
- 정확한 표현은 “가능하지만 Hermes가 하네스 역할을 해 속도와 운영 안정성을 높인다”이다.
- 공개 페이지에서는 내부 토큰, private path, raw logs, profile credential 구조를 설명하지 않는다.
