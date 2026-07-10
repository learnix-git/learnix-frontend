// * Accept *

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// TODO: Làm xong nhớ kiểm tra lại

const TEACHER_ROUTES = [
  '/post-classrooms',  
  '/dashboard-teacher'    
];

const STUDENT_ROUTES = [
  '/dashboard-student',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Kiểm tra đường dẫn
  const isTeacherRoute = TEACHER_ROUTES.some((route) => pathname.startsWith(route));
  const isStudentRoute = STUDENT_ROUTES.some((route) => pathname.startsWith(route));

  // Đường dẫn công khai thì cho qua
  if (!isTeacherRoute && !isStudentRoute) {
    return NextResponse.next();
  }

  // Lấy token từ cookie
  const token = request.cookies.get('auth_token')?.value;

  // Không có token redirect về đăng nhập
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    // Giải mã token
    const decoded: any = jwtDecode(token);
    const userRole = decoded.role; 

    if (isTeacherRoute && userRole !== 'TEACHER') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isStudentRoute && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};