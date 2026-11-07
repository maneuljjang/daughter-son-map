// 부모님 의견 전달 — 화면 코드는 이 파일의 함수만 씁니다.
//
// 1차 (기본, VITE_FEEDBACK=kakao)
//   의견은 이 휴대폰에만 잠깐 저장하고, [답장 보내기]를 누르면 카톡 공유로 문구를 보냅니다.
//   답장 카드의 링크(…/?r=…&swap=…&like=…)를 자녀가 열면 바꿀 장소가 표시됩니다.
//
// 2차 (VITE_FEEDBACK=firestore)
//   firestore.js 를 채우면 의견이 invites/{inviteId}/votes/{placeId} 에 저장되고,
//   자녀 화면이 subscribe 로 실시간으로 받아 봅니다. 화면 코드는 바꾸지 않아도 됩니다.

import * as local from './localVotes.js'
import * as firestore from './firestore.js'
import { getPlace } from '../data/places.js'

export const FEEDBACK_MODE = import.meta.env.VITE_FEEDBACK === 'firestore' ? 'firestore' : 'kakao'

/** vote: 'like' | 'hard' | null(취소) */
export async function submitVote(inviteId, placeId, vote) {
  local.setVote(inviteId, placeId, vote)
  if (FEEDBACK_MODE === 'firestore' && inviteId) await firestore.setVote(inviteId, placeId, vote)
}

export function getVotes(inviteId) {
  return local.getVotes(inviteId)
}

/** 자녀 화면에서 의견을 받아 보기. 1차에서는 아무것도 하지 않아요. 반환값: 구독 해제 함수 */
export function subscribeVotes(inviteId, onChange) {
  if (FEEDBACK_MODE === 'firestore' && inviteId) return firestore.subscribeVotes(inviteId, onChange)
  return () => {}
}

/** { guk: 'like', simujang: 'hard' } → 카톡 답장 문구 */
export function buildReplyText(votes) {
  const like = Object.keys(votes).filter((id) => votes[id] === 'like').map(shortName).filter(Boolean)
  const hard = Object.keys(votes).filter((id) => votes[id] === 'hard').map(shortName).filter(Boolean)
  const lines = []
  if (hard.length) lines.push(`${joinKo(hard)}${josa(hard.at(-1), '은', '는')} 좀 힘들 것 같아, 다른 데로 바꿔줘.`)
  if (like.length) lines.push(`${joinKo(like)}${josa(like.at(-1), '은', '는')} 좋아!`)
  if (!lines.length) lines.push('초대장 잘 받았어. 다 좋아!')
  return lines.join('\n')
}

const shortName = (id) => {
  const p = getPlace(id)
  return p ? p.short || p.name : null
}

function joinKo(names) {
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')}, ${names.at(-1)}`
}

/** 받침 유무에 따라 조사 고르기 (은/는) */
export function josa(word, withFinal, withoutFinal) {
  const ch = word?.trim().at(-1)
  if (!ch) return withoutFinal
  const code = ch.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171) return withoutFinal // 한글이 아니면 대충
  return code % 28 ? withFinal : withoutFinal
}
