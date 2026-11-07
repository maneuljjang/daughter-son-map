// ─────────────────────────────────────────────────────────────
// 2차: Firebase Firestore 로 부모님 의견 저장 (아직 비활성)
//
// 켜는 방법
//   1) npm install firebase
//   2) .env 에 VITE_FEEDBACK=firestore 와 Firebase 웹 앱 설정값을 넣기
//        VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID
//   3) 아래 주석 처리된 코드를 풀기
//
// 저장 구조
//   invites/{inviteId}                 { ids: ['guk', …], createdAt }
//   invites/{inviteId}/votes/{placeId} { vote: 'like' | 'hard', updatedAt }
//
// 보안 규칙 예시 (로그인 없이 쓰는 구조라 초대장 id 를 아는 사람만 쓰도록 최소한으로)
//   match /invites/{inviteId}/votes/{placeId} {
//     allow read: if true;
//     allow write: if request.resource.data.vote in ['like', 'hard'];
//   }
// ─────────────────────────────────────────────────────────────

// import { initializeApp } from 'firebase/app'
// import { getFirestore, doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore'
//
// const app = initializeApp({
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// })
// const db = getFirestore(app)

export async function setVote(inviteId, placeId, vote) {
  // const ref = doc(db, 'invites', inviteId, 'votes', placeId)
  // if (vote) await setDoc(ref, { vote, updatedAt: serverTimestamp() })
  // else await deleteDoc(ref)
  console.warn('[feedback] Firestore 가 아직 설정되지 않았어요 (src/feedback/firestore.js)', { inviteId, placeId, vote })
}

/** onChange({ placeId: 'like' | 'hard' }) 를 호출하고, 구독 해제 함수를 돌려줍니다 */
export function subscribeVotes(inviteId, onChange) {
  // return onSnapshot(collection(db, 'invites', inviteId, 'votes'), (snap) => {
  //   const votes = {}
  //   snap.forEach((d) => { votes[d.id] = d.data().vote })
  //   onChange(votes)
  // })
  console.warn('[feedback] Firestore 가 아직 설정되지 않았어요', inviteId, onChange)
  return () => {}
}
