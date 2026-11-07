// 이 휴대폰 안에만 저장하는 의견 (새로고침해도 남도록)
const key = (inviteId) => `dsm.votes.${inviteId || 'none'}`

export function getVotes(inviteId) {
  try {
    return JSON.parse(localStorage.getItem(key(inviteId))) || {}
  } catch {
    return {}
  }
}

export function setVote(inviteId, placeId, vote) {
  const votes = getVotes(inviteId)
  if (vote) votes[placeId] = vote
  else delete votes[placeId]
  try {
    localStorage.setItem(key(inviteId), JSON.stringify(votes))
  } catch {
    /* 저장이 막힌 브라우저면 이번 화면에서만 기억 */
  }
  return votes
}
