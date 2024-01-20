// jwt-auth.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true; // No authentication required for public routes
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return false;
    }

    try {
      const decodedToken = this.jwtService.verify(token);
      request.user = decodedToken; // Attach the user information to the request
      return true;
    } catch (error) {
      return false;
    }
  }

  private extractToken(request: any): string | null {
    if (
      request.headers.authorization &&
      request.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      return request.headers.authorization.split(' ')[1];
    } else if (request.cookies && request.cookies['jwt']) {
      return request.cookies['jwt'];
    }
    return null;
  }
}
