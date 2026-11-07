import { loadKakaoSdk } from './kakaoLoader.js'
import { absoluteAsset } from './url.js'
import { formatKm, formatMin } from './route.js'
import { formatWhen } from './schedule.js'

export const INVITE_TITLE = '엄마, 아빠 이번에 올라오시면 여기 가요'

const shareImage = () => import.meta.env.VITE_SHARE_IMAGE_URL || absoluteAsset('share/invite-card.png')

/** 카드 설명 문구 (카톡 피드 설명은 짧을수록 잘 보여요) */
export function inviteSummary(route, { date, time, from } = {}) {
  const names = route.stops.map((p) => p.name).join(' → ')
  const head = [from && `${from} 드림`, (date || time) && `📅 ${formatWhen(date, time)}`].filter(Boolean).join(' · ')
  return `${head ? `${head}\n` : ''}${names}\n걷는 길 약 ${formatKm(route.totalWalk)} · ${formatMin(route.totalMinutes)} · 난이도 ${route.difficulty}`
}

/** 자녀 → 부모님: 초대장 카드 */
export async function sendInvite({ route, url, extra }) {
  const Kakao = await loadKakaoSdk()
  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: INVITE_TITLE,
      description: inviteSummary(route, extra),
      imageUrl: shareImage(),
      imageWidth: 800,
      imageHeight: 400,
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [{ title: '초대장 열기', link: { mobileWebUrl: url, webUrl: url } }],
  })
}

/** 부모님 → 자녀: 답장 문구 */
export async function sendReply({ text, url }) {
  const Kakao = await loadKakaoSdk()
  Kakao.Share.sendDefault({
    objectType: 'text',
    text: text.slice(0, 200),
    link: { mobileWebUrl: url, webUrl: url },
    buttonTitle: '코스 바꾸러 가기',
  })
}
