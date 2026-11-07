/** 받침 유무에 따라 조사 고르기 (은/는) */
export function josa(word, withFinal, withoutFinal) {
  const ch = word?.trim().at(-1)
  if (!ch) return withoutFinal
  const code = ch.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171) return withoutFinal // 한글이 아니면 대충
  return code % 28 ? withFinal : withoutFinal
}
