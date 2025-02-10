import Cookies from 'js-cookie'

export function setCookie(name: string, value: string, days: number = 7) {
  Cookies.set(name, value, {
    expires: days,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  })
}

export function getCookie(name: string): string | undefined {
  return Cookies.get(name)
}

export function removeCookie(name: string) {
  Cookies.remove(name, { path: '/' })
}

export function clearOrderCookies() {
  const orderCookies = [
    'monthlyBill',
    'address',
    'selectedUtility',
    'selectedPackage',
    'selectedPackageData',
    'proposalData'
  ]
  
  orderCookies.forEach(cookie => removeCookie(cookie))
} 