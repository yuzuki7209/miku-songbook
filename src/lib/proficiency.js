// 오타마톤 페이더 위치 순서대로: 왼쪽(낮음) -> 오른쪽(높음)
export const PROFICIENCY_LEVELS = [
  { id: 'cry', label: 'ㅠㅠ', badgeClass: 'badge-cry' },
  { id: 'okay', label: '어버버', badgeClass: 'badge-okay' },
  { id: 'good', label: '잘함', badgeClass: 'badge-good' },
]

export const DEFAULT_PROFICIENCY = 'okay'

export function getProficiency(id) {
  return PROFICIENCY_LEVELS.find((level) => level.id === id) || PROFICIENCY_LEVELS[1]
}
