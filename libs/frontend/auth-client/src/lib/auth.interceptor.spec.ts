import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from './auth.store';

// AuthStore decodes the token, so the tests need real-looking JWTs.
function fakeJwt(id: string): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  const payload = {
    sub: 'user-1',
    email: 'user@test.dev',
    roles: ['CLIENT'],
    iat: 1,
    exp: 9999999999,
    jti: id,
  };
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.sig`;
}

// Lets pending promise callbacks (the store's async refresh) run.
const tick = () => new Promise<void>((resolve) => setTimeout(resolve));

const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authStore: InstanceType<typeof AuthStore>;
  let navigate: ReturnType<typeof vi.spyOn>;

  const TOKEN_A = fakeJwt('a');
  const TOKEN_B = fakeJwt('b');

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
    navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);

    const login = authStore.login('user@test.dev', 'secret');
    httpMock.expectOne('/api/auth/login').flush({ accessToken: TOKEN_A });
    await login;
  });

  afterEach(() => httpMock.verify());

  it('attaches the access token to requests', () => {
    http.get('/api/orders').subscribe();

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN_A}`);
    req.flush([]);
  });

  it('refreshes on 401 and retries the request with the new token', async () => {
    const results: unknown[] = [];
    http.get('/api/orders').subscribe((body) => results.push(body));

    httpMock.expectOne('/api/orders').flush(null, UNAUTHORIZED);
    await tick();
    httpMock.expectOne('/api/auth/refresh').flush({ accessToken: TOKEN_B });
    await tick();

    const retry = httpMock.expectOne('/api/orders');
    expect(retry.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN_B}`);
    retry.flush(['order']);

    expect(results).toEqual([['order']]);
    expect(authStore.accessToken()).toBe(TOKEN_B);
  });

  it('shares one refresh between simultaneous 401 responses', async () => {
    const results: unknown[] = [];
    http.get('/api/orders').subscribe((body) => results.push(body));
    http.get('/api/menu').subscribe((body) => results.push(body));

    httpMock.expectOne('/api/orders').flush(null, UNAUTHORIZED);
    httpMock.expectOne('/api/menu').flush(null, UNAUTHORIZED);
    await tick();

    // expectOne throws if there is more than one refresh request.
    httpMock.expectOne('/api/auth/refresh').flush({ accessToken: TOKEN_B });
    await tick();

    httpMock.expectOne('/api/orders').flush('orders');
    httpMock.expectOne('/api/menu').flush('menu');

    expect(results).toEqual(['orders', 'menu']);
  });

  it('logs out and goes to /login when the refresh fails', async () => {
    let error: { status?: number } | undefined;
    http.get('/api/orders').subscribe({ error: (e) => (error = e) });

    httpMock.expectOne('/api/orders').flush(null, UNAUTHORIZED);
    await tick();
    httpMock.expectOne('/api/auth/refresh').flush(null, UNAUTHORIZED);
    await tick();
    // logout() also tells the server to drop the cookie.
    httpMock.expectOne('/api/auth/logout').flush(null);

    expect(error?.status).toBe(401);
    expect(authStore.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not try to refresh when the login endpoint itself returns 401', async () => {
    let error: { status?: number } | undefined;
    http
      .post('/api/auth/login', {})
      .subscribe({ error: (e) => (error = e) });

    httpMock.expectOne('/api/auth/login').flush(null, UNAUTHORIZED);
    await tick();

    expect(error?.status).toBe(401);
    httpMock.expectNone('/api/auth/refresh');
  });
});
