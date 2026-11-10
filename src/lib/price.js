// 부모님께 가격을 숨길 때 쓰는 도우미

/** 문장 속 가격 지우기: '…양식. 1인 17,000~45,000원.' → '…양식.' */
export function stripPrice(text = '') {
  return text
    .replace(/\s*(1인\s*)?\d[\d,]*(\s*~\s*\d[\d,]*)?\s*원\.?/g, '')
    .replace(/\s+([.,])/g, '$1')
    .trim()
}
