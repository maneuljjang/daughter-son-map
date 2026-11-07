import { useState } from 'react'
import BottomSheet from '../components/ui/BottomSheet.jsx'
import { buildReplyText } from '../feedback/index.js'
import { sendReply } from '../lib/kakaoShare.js'
import { replyUrl } from '../lib/url.js'

export default function ReplySheet({ ids, inviteId, votes, extra, onClose }) {
  const relevant = Object.fromEntries(Object.entries(votes).filter(([k]) => ids.includes(k)))
  const [text, setText] = useState(() => buildReplyText(relevant))
  const [msg, setMsg] = useState('')
  const url = replyUrl(ids, inviteId, {
    swap: ids.filter((id) => relevant[id] === 'hard'),
    like: ids.filter((id) => relevant[id] === 'like'),
    ...extra,
  })

  const send = async () => {
    try {
      await sendReply({ text, url })
    } catch (e) {
      console.error(e)
      setMsg('카카오톡을 열지 못했어요. 아래 [문구 복사]를 눌러 직접 보내 주세요.')
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setMsg('복사했어요. 카카오톡 대화방에 붙여 넣어 주세요.')
    } catch {
      setMsg('복사가 안 되는 화면이에요. 글을 길게 눌러 복사해 주세요.')
    }
  }

  return (
    <BottomSheet title="답장 보내기" onClose={onClose} className="iv-sheet">
      <p className="iv-note" style={{ marginTop: 0 }}>이렇게 보낼게요. 고쳐 쓰셔도 돼요.</p>
      <textarea className="iv-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={200} />
      <button className="btn btn-kakao btn-lg btn-block" onClick={send} style={{ marginTop: 12 }}>
        카카오톡으로 보내기
      </button>
      <button className="btn btn-lg btn-block" onClick={copy} style={{ marginTop: 10 }}>
        문구 복사
      </button>
      {msg && <p className="iv-note" role="status">{msg}</p>}
    </BottomSheet>
  )
}
