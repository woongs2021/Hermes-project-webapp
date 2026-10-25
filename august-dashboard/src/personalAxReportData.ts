export type PersonalAxReportId = 'ai-research' | 'design-research' | 'ax-trends'

export type ReportSource = {
  title: string
  href: string
  status: 'Muyeol GO' | 'Muyeol WATCH'
}

export type PersonalAxReport = {
  id: PersonalAxReportId
  label: string
  eyebrow: string
  title: string
  dek: string
  sections: Array<{
    heading: string
    paragraphs: string[]
    bullets?: string[]
  }>
  sources: ReportSource[]
  prompts: string[]
}

/**
 * Public-safe editorial data. This module intentionally contains only stable paper
 * titles, public source URLs, and clearly labelled editorial interpretation.
 */
export const personalAxReports: PersonalAxReport[] = [
  {
    id: 'ai-research',
    label: 'AI 리서치',
    eyebrow: 'October 2026 · Muyeol-validated research note',
    title: '에이전트의 신뢰는 “얼마나 많이 하는가”보다 “언제 멈추고 되돌릴 수 있는가”에서 시작된다',
    dek: '10월의 AI 리서치는 완전 자동화의 매력보다 실행 중 통제, 프라이버시, 구현 검증을 더 중요한 제품 언어로 남겼다.',
    sections: [
      {
        heading: '이번 달의 선택',
        paragraphs: [
          'Muyeol이 GO로 남긴 10월의 논문들은 서로 다른 기술 층을 다루지만, 공통적으로 에이전트의 권한을 화면 밖으로 숨기지 말라고 말한다. 「Privacy Preference Controls for Agentic Systems」은 데이터 수집·공유·보존·자율 실행이 실제 작업 흐름 안에서 관찰되고 수정될 수 있어야 한다는 문제를 제기한다. 이는 동의 화면 한 번으로 신뢰를 확보한다는 관성보다, 사용자가 지금 무엇을 맡겼고 무엇을 철회할 수 있는지를 계속 확인하는 경험에 가깝다.',
          '「Plan-Then-Execute」와 「DAC-Bench」는 이 판단을 인터랙션과 평가의 언어로 보완한다. 계획을 먼저 드러내고 단계적으로 실행하는 구조는 사용자의 개입권을 남기며, 모바일 에이전트의 품질도 성공 장면 하나가 아니라 분기·회복·복합 과업에서 검토해야 한다. 여기서의 해석은 특정 패턴이 모든 상황의 정답이라는 뜻이 아니다. 위험도, 숙련도, 민감도에 따라 확인의 밀도와 되돌리기 경로를 달리 설계해야 한다는 운영 원칙이다.',
        ],
        bullets: [
          'Muyeol 선택 신호: 실행 전 계획 공개, 실행 중 권한 확인, 실행 후 회복 가능성.',
          '제품 적용 질문: 사용자가 권한 범위·데이터 흐름·철회 결과를 한 화면에서 이해할 수 있는가?',
          '검증 경계: 벤치마크나 프로토타입의 결과를 실제 서비스 신뢰성으로 일반화하지 않는다.',
        ],
      },
      {
        heading: '릴리스 QA로 번역하기',
        paragraphs: [
          '「Design Theater」는 생성형 UI의 설명과 실제 구현 사이에 틈이 생길 수 있음을 보여준다. 따라서 AX 화면은 설득력 있는 rationale보다 렌더된 상태, 접근성, 실제 동작의 일치를 먼저 확인해야 한다. 이번 달의 리서치가 남긴 가장 실무적인 결론은 간단하다. 에이전트가 하는 일을 더 예쁘게 설명하는 대신, 계획·권한·실행·오류·복구의 흔적을 사용자가 따라갈 수 있게 만들자. 이것이 Muyeol의 GO를 제품 품질로 옮기는 안전한 방식이다.',
          'Yuna의 기술 신호는 이 원칙을 시스템 요구로, Go Youn-jung의 UX 관점은 사용자가 실제로 읽고 선택할 수 있는 흐름으로 바꾼다. Son의 시장 해석까지 더하면, 차별화의 대상은 “자동으로 해 주는 기능” 자체보다 과업별 승인 리듬, 예외 처리, 관리자 리뷰를 함께 제공하는 운영 경험이다. 그래서 다음 프로토타입은 한 번의 성공 데모가 아니라, 중단 요청·권한 축소·실패 후 재시도 세 장면을 같은 중요도로 검증해야 한다. 이때 알림을 늘리는 것만으로는 충분하지 않다. 왜 확인이 필요한지, 확인하지 않으면 어떤 범위가 실행되는지, 나중에 무엇을 되돌릴 수 있는지를 짧고 구체적으로 보여줘야 한다. 신뢰는 매끄러운 자동화가 아니라 사용자가 결정권을 잃지 않았다고 느끼는 반복 경험에서 쌓인다.',
        ],
      },
    ],
    sources: [
      { title: 'Privacy Preference Controls for Agentic Systems', href: 'https://arxiv.org/abs/2610.29929', status: 'Muyeol GO' },
      { title: 'Plan-Then-Execute: An Empirical Study of User Trust and Team Performance When Using LLM Agents As A Daily Assistant', href: 'https://doi.org/10.1145/3706598.3713218', status: 'Muyeol GO' },
      { title: 'Design Theater: Evaluating the Gap Between User-Facing Design Reasoning and Implementation in Generative UI Tools', href: 'https://doi.org/10.1609/aies.v9i2.43227', status: 'Muyeol GO' },
    ],
    prompts: [
      '[Midjourney prompt placeholder] Calm editorial visualization of scoped agent permissions, warm-white paper, cobalt control markers, no text, no dashboard clichés.',
      '[Midjourney prompt placeholder] A staged execution path with one human intervention point, tactile glass and restrained coral signal, no readable UI text.',
    ],
  },
  {
    id: 'design-research',
    label: '디자인 리서치',
    eyebrow: 'October 2026 · Muyeol-selected design capability note',
    title: 'AI 리터러시는 프롬프트 속도가 아니라 판단·평가·독창성을 함께 다루는 디자인 역량이다',
    dek: '10월의 디자인 리서치는 AI 도입 이후에도 디자이너가 사라지지 않는 이유를 산출물 생산이 아닌 검토와 책임의 언어로 정리한다.',
    sections: [
      {
        heading: '도구 숙련을 넘어서는 기준',
        paragraphs: [
          'Muyeol이 GO로 선택한 「Measuring AI literacy in design education」은 디자인 맥락의 AI 역량을 단순한 사용 빈도나 프롬프트 요령으로 축소하지 않는다. AI 개념과 도구 이해, 윤리·독창성, 디자인 가치 인식, 출력 평가가 함께 다뤄져야 한다는 신호가 핵심이다. 학생 대상 척도 개발 연구이므로 이를 곧바로 채용 KPI나 실무 성과표로 옮길 수는 없다. 다만 팀이 무엇을 학습하고 어떤 리뷰 언어를 공유해야 하는지 묻는 출발점으로는 충분히 유효하다.',
          '9월의 Muyeol 선택 「Designing With AI」와 「What is Human-Centered about Human-Centered AI?」를 함께 읽으면 더 분명해진다. AI 지원 도구는 창의성을 자동으로 높이거나 낮추는 단일 원인이 아니다. 디자이너가 어디서 질문을 만들고, 어느 결과를 반려하며, 사용자와 사회에 미칠 영향을 누가 확인하는지에 따라 도구의 의미가 달라진다. 이 문단은 논문들의 결과를 제품 효과로 단정하는 것이 아니라, 10월 작업에 적용한 해석이다.',
        ],
        bullets: [
          'Muyeol 선택 신호: 출력 생성보다 판단 기준과 검증 루프를 먼저 설계한다.',
          '팀 리뷰 질문: 이 결과는 독창성·접근성·사용자 통제의 기준을 통과했는가?',
          '교육 적용 질문: 툴 데모 뒤에 반례 탐색·출처 확인·수정 이유 기록이 남는가?',
        ],
      },
      {
        heading: '디자인 운영으로 번역하기',
        paragraphs: [
          '이번 달에는 AI 리터러시를 개인의 스킬 배지보다 작은 운영 체계로 제안한다. 첫째, 생성 전에 사용자의 문제와 금지선을 기록한다. 둘째, 생성 후에는 화면의 설득력과 실제 구현 가능성을 분리해 본다. 셋째, 최종 판단에는 근거와 보류 사유를 남긴다. 이 순서는 느려 보이지만 재작업과 책임 공백을 줄인다. 디자인 리더의 역할은 더 많은 이미지를 생산하는 사람이 아니라, 좋은 질문·평가·수정이 반복될 조건을 만드는 사람으로 이동한다.',
          'Go Youn-jung이 정리한 공동 작업과 정보 위계의 관점은 이 운영 체계가 산출물 평가표로 끝나지 않게 한다. Yuna의 AI 신호는 모델 능력의 변화가 빠르다는 사실을 알려 주지만, Son의 현장 정착 관점은 주니어가 어떤 과업에서 도움을 받고 어디서 피드백을 배워야 하는지까지 묻게 한다. 따라서 팀은 “누가 프롬프트를 가장 잘 쓰는가”보다 문제 정의, 근거 확인, 반례 탐색, 수정 이유 설명을 한 번의 리뷰 안에 남길 수 있는가를 봐야 한다. 리뷰어는 정답을 고르는 사람이기보다, 불확실한 부분을 표시하고 다음 실험을 더 작게 만드는 사람이어야 한다. 이 기록은 개인의 감각을 통제하려는 장치가 아니라, 서로 다른 숙련도가 함께 판단을 개선하기 위한 공용 언어다.',
        ],
      },
    ],
    sources: [
      { title: 'Measuring AI literacy in design education: development and validation of the artificial intelligence literacy scale for design students', href: 'https://doi.org/10.1007/s10798-026-10128-0', status: 'Muyeol GO' },
      { title: 'Designing With AI: A Systematic Literature Review on the Use, Development, and Perception of AI-Enabled UX Design Tools', href: 'https://doi.org/10.1155/ahci/3869207', status: 'Muyeol GO' },
      { title: 'What is Human-Centered about Human-Centered AI? A Map of the Research Landscape', href: 'https://doi.org/10.1145/3544548.3580959', status: 'Muyeol GO' },
    ],
    prompts: [
      '[Midjourney prompt placeholder] Editorial desk with annotated design artifacts and one quiet AI review signal, soft paper grain, muted cobalt and coral, no text.',
      '[Midjourney prompt placeholder] Abstract composition of human judgment and machine output held in balance, generous negative space, calm research publication mood.',
      '[Midjourney prompt placeholder] Tactile quality-review tokens arranged as a learning system, warm-white background, no logos, no readable labels.',
    ],
  },
  {
    id: 'ax-trends',
    label: 'AX 트렌드',
    eyebrow: 'October 2026 · synthesis, not prediction',
    title: 'AX의 다음 경쟁은 자동화의 양이 아니라 통제 가능한 운영 품질을 누가 설계하는가에 달려 있다',
    dek: '10월의 선택 논문을 한데 보면 AX는 기능 도입 프로젝트가 아니라 신뢰·검증·조직 학습을 연결하는 경험 운영의 문제로 이동하고 있다.',
    sections: [
      {
        heading: '세 가지 변화',
        paragraphs: [
          '첫째, 개인화는 더 많이 기억하는 기능이 아니라 사용자가 범위를 지정하고 수정하며 잊게 할 수 있는 권한 설계가 되고 있다. 「Privacy Preference Controls for Agentic Systems」은 이 흐름을 가장 선명하게 보여준다. 둘째, 생성형 인터페이스의 평가는 데모의 설득력에서 구현의 일치로 이동한다. 「Design Theater」가 지적한 설명-구현 간극은 AX 팀에 접근성, 동작, 오류 회복을 릴리스 기준으로 되돌려 놓는다. 셋째, 디자인 조직의 경쟁력은 도구 보유가 아니라 구성원이 결과를 평가하고 반례를 찾는 능력에서 나온다.',
          '이 세 변화는 기술 예측이 아니라 Muyeol이 선택·검증한 논문에서 추출한 해석이다. 특히 「Measuring AI literacy in design education」의 학생 대상 결과를 모든 조직의 성과 법칙으로 확대하지 않으며, 「Plan-Then-Execute」의 상호작용 패턴도 과업과 위험이 다른 환경에 그대로 복제하지 않는다. 대신 AX 리더가 지금 결정할 수 있는 작은 질문으로 낮춘다. 사용자는 무엇을 승인하는가, 팀은 무엇을 테스트하는가, 그리고 실패했을 때 누가 어떤 기록을 보고 되돌리는가.',
        ],
        bullets: [
          'Trend 01 · 권한: 동의 중심에서 실행 중 관찰·수정·철회 중심으로.',
          'Trend 02 · 품질: 생성 속도 중심에서 접근성·구현·복구의 추적 가능성 중심으로.',
          'Trend 03 · 역량: 툴 숙련 중심에서 판단·윤리·출력 평가를 포함하는 학습 체계 중심으로.',
        ],
      },
      {
        heading: '11월로 가져갈 운영 질문',
        paragraphs: [
          '다음 달에는 새로운 기능 목록보다 하나의 얇은 검증 루프를 먼저 만든다. 에이전트 작업마다 계획 미리보기, 권한 범위, 중단·되돌리기, 실행 로그의 네 지점을 점검한다. 디자인 산출물에는 주장한 근거와 실제 화면을 대조하는 QA를 붙인다. 마지막으로 팀 회고에서는 “AI가 해냈다”가 아니라 “누가 어떤 근거로 승인했고 무엇을 다음에 검증할 것인가”를 남긴다. 이 기록이 쌓일 때 AX는 유행어가 아니라 조직이 재사용할 수 있는 신뢰의 운영체계가 된다.',
          '이 방향은 Yuna가 포착한 기술·고용 변화, Go Youn-jung이 읽은 디자인 공동 작업의 품질, Son이 번역한 현장 정착과 브랜드 검수의 시장 가치를 한 줄로 연결한다. 당장 필요한 것은 거대한 전환 프로그램보다 각 팀이 공통으로 쓸 수 있는 작은 증거 포맷이다. 예를 들어 기능마다 위임 범위, 사용자 확인 문구, 실패 시 복구 책임자, 다음 검증 지표를 한 장에 남긴다. 이 포맷은 실패를 숨기는 보고서가 아니라 다음 결정의 비용을 낮추는 팀의 기억이 된다. 그렇게 하면 속도와 안전을 맞바꾸지 않고도, 무엇이 실제 가치인지 차분하게 비교할 수 있다. AX의 성숙도는 AI를 얼마나 넓게 붙였는지가 아니라 이 판단의 흔적을 얼마나 투명하게 축적하는지에서 드러난다.',
        ],
      },
    ],
    sources: [
      { title: 'Privacy Preference Controls for Agentic Systems', href: 'https://arxiv.org/abs/2610.29929', status: 'Muyeol GO' },
      { title: 'Design Theater: Evaluating the Gap Between User-Facing Design Reasoning and Implementation in Generative UI Tools', href: 'https://doi.org/10.1609/aies.v9i2.43227', status: 'Muyeol GO' },
      { title: 'Measuring AI literacy in design education: development and validation of the artificial intelligence literacy scale for design students', href: 'https://doi.org/10.1007/s10798-026-10128-0', status: 'Muyeol GO' },
    ],
    prompts: [
      '[Midjourney prompt placeholder] Quiet AX operating loop as an editorial diagram, four tactile checkpoints, restrained warm-cool palette, no readable text.',
      '[Midjourney prompt placeholder] A protected human decision space surrounded by subtle agent signals, calm premium product editorial, no sci-fi clichés.',
    ],
  },
]
