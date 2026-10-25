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
          '실무에서는 이를 “확인해야 하는 순간을 늦추지 않는 설계”로 바꿔 볼 수 있다. 사용자가 자료를 요약해 달라고 했을 때에는 어떤 출처를 읽을지와 어디까지 외부 공유가 가능한지를 먼저 보이고, 메시지를 보내거나 파일을 바꾸는 작업에서는 대상·범위·되돌리기 방법을 실행 직전에 다시 확인한다. 반대로 위험이 낮고 되돌리기 쉬운 정리 작업은 반복 확인을 줄여 흐름을 지켜야 한다. 같은 에이전트라도 모든 행동에 같은 마찰을 주면 피로가 되고, 아무 표시도 하지 않으면 불안이 된다. 좋은 AX는 이 두 극단 사이에서 위험의 크기와 사용자의 맥락을 읽어 확인의 밀도를 조절하는 일이다.',
          '품질 지표도 바뀐다. 완료율만 보면 빠르게 끝난 자동화가 좋아 보이지만, 사용자가 실행 전에 목적을 수정할 수 있었는지, 예상과 다른 결과를 발견했을 때 중단할 수 있었는지, 실패 뒤에 무엇이 바뀌었는지 설명받았는지는 별도로 봐야 한다. Muyeol이 지적한 연구의 한계 역시 이 지점에서 중요하다. 논문의 분류 체계나 프로토타입이 실제 서비스의 법적 적합성, 장기 사용성, 조직별 권한 구조를 보장하지는 않는다. 그러므로 이번 리포트는 정답 패턴을 선언하기보다, 출시 전 팀이 확인할 질문과 사용자가 실제로 행사할 수 있어야 할 권리를 정리하는 데 초점을 둔다.',
          '다음 실험의 단위는 크지 않아도 된다. 한 개의 에이전트 작업을 골라 사용자가 처음 보는 계획 문장, 권한을 바꾸는 제어, 실행 중 상태 표시, 작업 뒤의 기록을 차례로 점검하면 된다. 이때 “설정”이라는 기술 용어만으로 범위를 감추지 말고, 예를 들어 연락처에 접근하는지, 초안을 외부 서비스에 보내는지, 저장한 자료가 다음 작업에도 남는지를 행동 중심의 언어로 써야 한다. 오류가 생겼을 때에도 단순한 실패 메시지보다 어디에서 멈췄는지, 자동으로 바뀐 것이 있는지, 사용자가 선택할 수 있는 다음 행동이 무엇인지 알려 주어야 한다. 사용자가 시스템을 완벽히 이해해야 한다는 뜻은 아니다. 중요한 순간에는 충분히 이해하고 판단할 수 있다는 감각, 그리고 필요하면 사람에게 넘길 수 있다는 확신을 만드는 것이 목표다. 이 작은 장면들을 통과한 뒤에야 더 넓은 자율 실행을 검토하는 순서가 안전하다.',
          '결국 에이전트 UX의 문장은 능력을 과장하는 광고 문구가 아니라 책임의 경계를 보여 주는 안내여야 한다. “대신 처리합니다”라고 말할 때에는 무엇을 대신하는지, 무엇은 대신하지 않는지, 사용자의 확인을 기다리는지까지 함께 알려야 한다. 화면 안의 작은 요약과 기록은 복잡한 기술을 전부 설명하기 위한 장치가 아니다. 사용자가 자기 데이터와 결정이 어디에 놓여 있는지 잃지 않게 하는 최소한의 표지다. 이 기준을 지키면 빠른 자동화와 인간적인 통제가 서로 반대가 아니라, 같은 경험 안에서 균형을 이루게 된다.',
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
          '이를 디자인 리뷰에 적용하면 회의의 질문도 달라진다. “AI가 만든 안 중 어느 것이 가장 보기 좋은가”만 묻는 대신, 이 안이 풀려는 사용자 문제는 무엇인지, 어떤 데이터나 레퍼런스가 판단을 뒷받침하는지, 누가 배제되거나 오해할 가능성이 있는지, 실제 화면에서 유지될 수 있는지를 차례로 확인한다. 특히 생성 이미지나 문구는 그럴듯함이 근거의 빈자리를 가리기 쉽다. 시각적 완성도가 높을수록 출처와 구현 조건을 더 분명히 적어야 한다. Go Youn-jung의 비선형 공동창작 관점은 이 과정을 한 번의 승인 관문이 아니라 탐색과 성찰을 오가는 루프로 보게 한다.',
          '학습의 단위 역시 개인의 생산량이 아니라 팀이 남기는 판단 흔적이 될 수 있다. 예를 들어 주니어 디자이너는 AI로 빠르게 만든 세 가지 안을 제출하는 데서 멈추지 않고, 채택하지 않은 안의 이유 한 가지와 다음 실험에서 바꿀 변수 한 가지를 함께 기록한다. 리드는 정답을 바로 주기보다 기준의 우선순위가 바뀐 이유를 설명한다. Son이 강조한 현장 정착의 관점에서는 이런 짧은 기록이 온보딩, 품질 관리, 브랜드 검수 사이를 이어 주는 공용 자산이 된다. 속도를 늦추기 위한 문서가 아니라, 같은 실패를 반복하지 않고 각자의 감각을 조직의 학습으로 연결하기 위한 최소한의 장치다.',
          '운영의 출발점은 거창한 새 도구가 아니라, 이미 있는 리뷰 문서의 칸을 몇 개 바꾸는 일일 수 있다. 문제 정의 아래에는 AI에 맡긴 범위를, 시안 아래에는 사람이 최종 확인한 항목을, 결정 아래에는 근거와 보류한 위험을 짧게 남긴다. 이 정보는 다음 사람이 과정을 재현하기 위한 복잡한 보고서가 아니라, 판단이 바뀌어도 이유를 잃지 않기 위한 맥락이다. 브랜드 관점에서도 중요하다. 생성 결과가 여러 채널로 빠르게 확장될수록 톤, 접근성, 문화적 맥락, 권리 이슈를 마지막에 한 번만 확인해서는 늦다. 각 단계에서 작은 경고와 검토 질문을 배치하면, 창의적 탐색을 막지 않으면서도 결과가 브랜드의 약속에서 멀어지는 순간을 빨리 발견할 수 있다. AI 리터러시는 결국 도구를 능숙하게 다루는 능력과 함께, 언제 멈추고 누구와 다시 판단할지를 아는 태도까지 포함한다.',
          '이 방식은 완벽한 문서를 요구하지 않는다. 한 화면의 의도와 한 번의 수정 이유, 확인이 필요한 위험 하나만 정확히 남겨도 다음 리뷰의 출발점이 된다. 중요한 것은 생성 속도를 평가의 속도로 착각하지 않는 일이다. 좋은 결과는 모델이 낸 첫 답에 있는 것이 아니라, 팀이 그 답을 의심하고 비교하고 다듬는 과정에서 나온다. AI가 넓혀 주는 선택지를 사람의 판단으로 다시 좁힐 수 있을 때, 디자인은 유행하는 도구의 산출물이 아니라 사용자에게 책임지는 경험으로 남는다.',
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
          '이 관점에서 AX 로드맵은 “기능을 몇 개 출시했는가”보다 사용자와 팀이 더 나은 결정을 할 수 있게 된 지점을 측정해야 한다. 첫 단계는 현재의 위임 흐름을 지도처럼 펼쳐 보는 일이다. 어떤 데이터가 들어오고, 어느 단계에서 자동 실행이 일어나며, 누가 최종 책임을 지는지 표시한다. 두 번째는 가장 위험하거나 가장 자주 되돌리는 한 장면을 골라 작은 프로토타입으로 시험하는 일이다. 마지막은 결과를 수치만으로 판정하지 않고, 사용자가 이해한 범위와 실제 실행 범위가 일치했는지, 예외 상황에서 도움을 받을 수 있었는지 인터뷰와 로그로 함께 살피는 일이다.',
          '조직 차원의 경쟁도 여기에서 갈린다. 모델을 빠르게 도입하는 일은 점점 쉬워지지만, 브랜드의 말투와 고객 약속을 해치지 않으면서 에이전트를 운영하는 일은 여전히 사람과 프로세스의 몫이다. Son의 해석처럼 시장의 가치는 범용 툴 교육보다 과업 분해, 예외 처리, 관리자 리뷰, 브랜드 출력 검수를 연결하는 전환 운영에 있다. Yuna의 고용 변화 리서치도 직업 소멸의 단정 대신 검증과 피드백이 있는 학습 사다리를 보라고 권한다. 따라서 11월의 우선순위는 더 많은 자동화를 발표하는 것이 아니라, 작은 책임 단위에서 통제·품질·학습이 함께 작동하는지를 증명하는 것이다.',
          '실행 계획은 세 가지 질문으로 간결하게 시작할 수 있다. 첫째, 사용자가 이 작업을 AI에게 맡기는 이유는 무엇이며, 사람이 직접 해야 하는 판단은 어디에 남아 있는가. 둘째, 잘못된 결과가 나왔을 때 비용이 큰 지점은 어디이고, 그 전에 어떤 신호를 보여 줄 수 있는가. 셋째, 팀이 이번 실험을 통해 배운 것을 다음 제품·브랜드·교육 결정에 어떻게 재사용할 것인가. 이 질문의 답을 기능 명세, 디자인 리뷰, 운영 회고에 같은 형식으로 남기면 부서마다 다른 언어로 말하던 기술·디자인·사업의 논의가 조금씩 연결된다. AX의 경쟁은 거대한 비전 문구를 반복하는 데 있지 않다. 사용자가 부담 없이 시작하고, 중요한 순간에는 자신의 선택을 확인하며, 팀은 그 선택의 결과에서 더 나은 다음 기준을 만드는 일상적인 리듬에 있다. 10월 리포트가 제안하는 것은 바로 그 리듬을 작지만 검증 가능한 단위로 시작하자는 것이다.',
          '그래서 리더가 팀에 줄 수 있는 가장 좋은 질문은 “무엇을 더 자동화할까”만이 아니다. 이 변화가 사용자의 시간을 어디에서 돌려주는지, 그 대신 새로 생기는 불안을 누가 어떻게 줄이는지, 실패한 사례를 다음 실험의 자산으로 남길 수 있는지를 함께 묻는 일이다. 이 질문이 반복되면 AX는 기술 조직의 프로젝트에 머물지 않고, 고객 경험과 브랜드 신뢰를 함께 지키는 운영 원칙이 된다. 10월의 관찰은 그 원칙이 선언보다 작고 선명한 실행 단위에서 먼저 증명돼야 한다는 데 있다.',
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
