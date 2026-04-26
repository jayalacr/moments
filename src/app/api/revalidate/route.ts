import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json();

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: 'Token de revalidación inválido' },
        { status: 401 }
      );
    }

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { message: 'Se requiere un path válido' },
        { status: 400 }
      );
    }

    revalidatePath(path, 'page');

    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al revalidar', error: String(error) },
      { status: 500 }
    );
  }
}
