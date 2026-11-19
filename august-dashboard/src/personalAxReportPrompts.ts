/**
 * Optional additive content for newly added reports. Existing reports omit this
 * field; a prompt section exists only when a future report supplies entries.
 */
export function getReportPrompts(report: { prompts?: string[] }): string[] {
  return report.prompts ?? []
}

export function renderReportPromptHtmlSection(
  report: { prompts?: string[] },
  escapeHtml: (value: string) => string,
): string {
  const prompts = getReportPrompts(report)
  if (prompts.length === 0) return ''

  return `<section><h2>미드저니 프롬프트</h2><ul>${prompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join('')}</ul></section>`
}
