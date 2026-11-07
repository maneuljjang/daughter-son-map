import { useMemo, useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet.jsx'
import { INVITE_TITLE, inviteSummary, sendInvite } from '../../lib/kakaoShare.js'
import { inviteUrl, newInviteId, asset } from '../../lib/url.js'

export default function PreviewSheet({ route, ids, inviteId, setInviteId, showToast, onBack, onClose }) {
  // 보낼 때마다 새 초대장 id (2차 Firestore 에서 초대장별 의견을 구분)
  const [draftId] = useState(() => newInviteId())
  const url = useMemo(() => inviteUrl(ids, draftId), [ids, draftId])
  const [busy, setBusy] = useState(false)

  const send = async () => {
    setBusy(true)
    try {
      await sendInvite({ route, url })
      setInviteId(draftId)
    } catch (e) {
      showToast(e.message === 'NO_KEY' ? '카카오 키가 없어요 (.env 확인)' : '카카오톡 공유를 열지 못했어요')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${INVITE_TITLE}\n${inviteSummary(route)}\n${url}`)
      setInviteId(draftId)
      showToast('초대장 링크를 복사했어요')
    } catch {
      window.prompt('아래 링크를 길게 눌러 복사하세요', url)
    }
  }

  return (
    <BottomSheet title="초대장 미리보기" onClose={onClose}>
      <div className="kakao-mock">
        <div className="kakao-bubble">
          <img src={asset('share/invite-card.png')} alt="" className="kakao-img" />
          <div className="kakao-body">
            <div className="kakao-title">{INVITE_TITLE}</div>
            <div className="kakao-desc">{inviteSummary(route)}</div>
          </div>
          <div className="kakao-btn">초대장 열기</div>
        </div>
      </div>
      {inviteId && inviteId !== draftId && <p className="small muted">이미 보낸 초대장이 있어요. 새로 보내면 새 초대장이 만들어져요.</p>}

      <div className="pv-actions">
        <button className="btn btn-kakao btn-block" onClick={send} disabled={busy}>
          카카오톡으로 초대장 보내기
        </button>
        <div className="pv-row">
          <button className="btn btn-sm" onClick={copy}>링크 복사</button>
          <a className="btn btn-sm" href={url} target="_blank" rel="noreferrer">부모님 화면 열어보기</a>
          <button className="btn btn-sm btn-ghost" onClick={onBack}>코스 수정</button>
        </div>
      </div>
    </BottomSheet>
  )
}
