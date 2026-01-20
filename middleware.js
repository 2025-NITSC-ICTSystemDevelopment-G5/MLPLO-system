import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get('adminToken');

  // 1. 管理者ページ (/admin/...) かつ ログイン画面 (/admin/login) ではない場合にチェック
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!adminToken) {
      // 2. 正しいログイン画面のパスを指定
      const loginUrl = new URL('/admin/login', request.url); 
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};