// 숫자를 소수 둘째 자리까지 고정해 적는다. 지역 함수를 쓰지 않아 어느 컴퓨터에서나 같다.
/** @param {number} n */
export function num(n) {
  let s = (Math.round(n * 100) / 100).toFixed(2);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}
