# Node.js — Middle Full-Stack Angular + Node Learning Spec

> Учебный roadmap и чек-лист тем для backend/Node.js. Используется вместе со
> скиллом `.cursor/skills/node-mentor/SKILL.md`, который реализует
> педагогику из раздела 2 ниже внутри Cursor. Вызывается явно как
> `/node-mentor`, или подключается автоматически на вопросах по темам этого
> документа.

## 1. Цель

Цель обучения — подготовить разработчика уровня Middle Full-Stack Developer с сильным Angular и рабочим Node.js/NestJS backend.

Frontend уже является сильной стороной. Основной фокус обучения — backend и Node.js.

После прохождения этого roadmap разработчик должен уметь:

* самостоятельно проектировать REST API;
* писать backend на Node.js + TypeScript + NestJS;
* работать с PostgreSQL и ORM;
* реализовывать authentication/authorization;
* понимать Node.js runtime и Event Loop;
* правильно работать с asynchronous code;
* писать backend validation и error handling;
* писать unit/integration/e2e tests;
* использовать Redis;
* понимать message queues;
* запускать backend в Docker;
* понимать базовое масштабирование backend;
* объяснять архитектурные решения на собеседовании;
* самостоятельно реализовать production-like Full Stack приложение.

---

## 2. Правила обучения Cursor

> Реализовано как `.cursor/skills/node-mentor/SKILL.md` — см. этот файл для
> механики. Текст ниже оставлен как источник правды для самого правила.

Cursor должен помогать разработчику учиться, а не просто писать код.

### Основное правило

Не выдавать готовое решение сразу, если задача относится к учебному материалу.

Сначала:

1. Объяснить, какую проблему нужно решить.
2. Дать направление.
3. Задать наводящий вопрос или предложить несколько вариантов.
4. Дать маленькую подсказку.
5. Только если разработчик явно просит — показать полное решение.
6. После решения объяснить, почему оно работает.

Если разработчик пишет код сам — сначала проверить его решение и указать проблемы, а не переписывать всё самостоятельно.

### Приоритет

Предпочитать:

* простое решение;
* читаемый код;
* стандартные возможности Node/Nest;
* минимальное количество абстракций;
* понятную архитектуру.

Не вводить сложные паттерны только ради демонстрации архитектуры.

Не использовать без необходимости:

* CQRS;
* Event Sourcing;
* сложные repository abstractions;
* excessive generic abstractions;
* микросервисы ради микросервисов;
* сложные dependency layers;
* premature optimization.

---

## 3. JavaScript fundamentals

Необходимо уверенно понимать JavaScript, потому что Node.js работает поверх JavaScript/TypeScript.

### Scope

Нужно знать:

* global scope;
* function scope;
* block scope;
* lexical scope;
* closures.

Уметь объяснить:

```ts
let
const
var
```

и различия между ними.

### Hoisting

Понимать:

* hoisting `var`;
* hoisting `let/const`;
* Temporal Dead Zone;
* hoisting function declarations.

### Closures

Понимать:

* что такое closure;
* lexical environment;
* почему функция может использовать переменные внешней функции после её завершения.

### this

Понимать:

```ts
obj.method()
```

```ts
const fn = obj.method;
fn();
```

```ts
bind()
call()
apply()
```

и отличие arrow function.

### Prototypes

Понимать:

* prototype;
* prototype chain;
* `Object.create`;
* `class`;
* `extends`;
* `super`.

Не обязательно знать глубокие внутренности V8.

### Objects

Уметь работать с:

* destructuring;
* spread;
* rest;
* computed properties;
* property descriptors на базовом уровне.

Понимать:

```ts
const copy = { ...object };
```

делает shallow copy.

### Map / Set

Понимать:

* Map;
* Set;
* когда использовать Map вместо object;
* поиск по ID через Map;
* уникальные значения через Set.

### Arrays

Уверенно знать:

```ts
map
filter
reduce
find
findIndex
some
every
includes
sort
slice
splice
push
pop
shift
unshift
```

Понимать какие методы мутируют массив.

### Copying

Различать:

* reference;
* shallow copy;
* deep copy.

Знать:

```ts
structuredClone()
```

и его ограничения.

---

## 4. Async JavaScript

Это одна из ключевых тем Node.js.

### Callbacks

Понимать:

* callback;
* callback-based APIs;
* callback hell;
* error-first callback pattern.

### Promise

Понимать состояния:

```text
pending
fulfilled
rejected
```

и:

```text
settled = fulfilled OR rejected
```

Понимать:

```ts
then()
catch()
finally()
```

и chaining.

### async / await

Понимать:

```ts
async function foo() {}
```

всегда возвращает Promise.

Понимать:

```ts
await promise
```

не блокирует JavaScript thread.

### Promise combinators

Знать:

```ts
Promise.all()
Promise.allSettled()
Promise.race()
Promise.any()
```

и различия между ними.

### Sequential vs concurrent

Понимать разницу:

```ts
const a = await requestA();
const b = await requestB();
```

и:

```ts
const [a, b] = await Promise.all([
  requestA(),
  requestB()
]);
```

Уметь определить, когда операции можно запускать параллельно.

### Error handling

Понимать:

```ts
try {
  await something();
} catch (error) {
}
```

и propagation ошибок через Promise chain.

### Cancellation

Знать:

```ts
AbortController
```

и понимать, что Promise сам по себе не имеет встроенной отмены.

---

## 5. Event Loop

Это обязательная тема для Node.js интервью.

Необходимо понимать:

```text
Call Stack
↓
Task / callback
↓
Microtasks
↓
Next task
```

### Нужно знать

* call stack;
* event loop;
* tasks/macrotasks;
* microtasks;
* Promise callbacks;
* timers;
* I/O callbacks;
* `process.nextTick`;
* `setImmediate`;
* `setTimeout`.

### Ключевой принцип

После выполнения текущей task Node/browser выполняет microtasks перед переходом к следующей task.

Нужно уметь предсказывать порядок выполнения простых примеров.

### Node-specific

Понимать разницу между:

```ts
process.nextTick()
queueMicrotask()
setImmediate()
setTimeout()
```

на уровне, достаточном для собеседования.

---

## 6. Node.js Runtime

### V8

Понимать:

* Node использует V8;
* V8 выполняет JavaScript;
* garbage collection на базовом уровне.

### libuv

Понимать:

* Event Loop;
* asynchronous I/O;
* thread pool;
* почему Node может обслуживать много I/O operations несмотря на single-threaded JavaScript execution.

### Single-threaded

Понимать утверждение:

> Node.js JavaScript execution is single-threaded.

Но также понимать:

* OS I/O;
* libuv;
* thread pool;
* Worker Threads.

Не говорить упрощённо:

> Node.js is completely single-threaded.

Это неточно.

### CPU-bound vs I/O-bound

Понимать:

```text
I/O-bound
CPU-bound
```

и почему CPU-heavy синхронная операция может заблокировать Event Loop.

---

## 7. Node.js Core APIs

Необходимо познакомиться с:

### fs

```ts
fs
fs/promises
```

Уметь:

* читать файл;
* писать файл;
* понимать sync vs async APIs.

### path

Понимать:

```ts
path.join()
path.resolve()
path.basename()
path.dirname()
```

### process

Знать:

```ts
process.env
process.argv
process.cwd()
process.exit()
```

### EventEmitter

Понимать:

```ts
on()
once()
emit()
off()
```

и event-driven architecture.

### http

Уметь объяснить базовый Node HTTP server без NestJS.

### crypto

Понимать назначение:

* hashing;
* random bytes;
* cryptographic operations.

---

## 8. Streams & Buffers

### Buffer

Понимать:

* бинарные данные;
* Buffer;
* отличие Buffer от string.

### Streams

Знать:

```text
Readable
Writable
Duplex
Transform
```

Понимать:

* chunks;
* streaming;
* backpressure на базовом уровне.

### Практический смысл

Понимать разницу между:

```text
загрузить 5 GB файл целиком в память
```

и:

```text
читать и обрабатывать его частями
```

---

## 9. npm / package management

Понимать:

* `package.json`;
* `package-lock.json`;
* dependencies;
* devDependencies;
* npm scripts;
* semantic versioning;
* npm install;
* npm ci.

Понимать:

```text
major
minor
patch
```

и диапазоны версий.

Знать основы:

* peerDependencies;
* ESM;
* CommonJS.

---

## 10. TypeScript для Node.js

Необходимо уверенно использовать:

* interfaces;
* types;
* unions;
* intersections;
* generics;
* utility types;
* mapped types;
* conditional types;
* `keyof`;
* `typeof`;
* `infer`;
* type guards;
* discriminated unions.

Особенно важно:

```ts
Partial
Required
Pick
Omit
Record
ReturnType
Parameters
Awaited
```

Понимать разницу между:

```ts
interface
type
```

и declaration merging.

---

## 11. HTTP / REST

Обязательная backend тема.

### HTTP methods

Знать:

```text
GET
POST
PUT
PATCH
DELETE
OPTIONS
HEAD
```

### Status codes

Уверенно понимать:

```text
200
201
204

400
401
403
404
409
422

500
```

### Request

Понимать:

```text
path params
query params
headers
body
cookies
```

### REST

Уметь спроектировать:

```text
GET /users
GET /users/:id
POST /users
PATCH /users/:id
DELETE /users/:id
```

### Pagination

Уметь реализовать:

```text
page
limit
offset
```

Понимать cursor pagination на базовом уровне.

### Filtering

Например:

```text
GET /users?status=active&role=admin
```

### Sorting

Например:

```text
GET /users?sortBy=createdAt&order=desc
```

### Idempotency

Понимать смысл idempotent operations.

### CORS

Понимать:

* Same-Origin Policy;
* CORS;
* preflight;
* OPTIONS;
* credentials.

Важно:

> CORS не является механизмом authentication.

---

## 12. NestJS

NestJS является основным backend framework.

### Architecture

Понимать:

```text
Module
  ↓
Controller
  ↓
Service
  ↓
ORM
  ↓
Database
```

### Modules

Уметь:

* создавать modules;
* разделять приложение по feature domains;
* экспортировать providers.

### Controllers

Понимать:

* routes;
* params;
* query;
* body;
* response;
* HTTP status.

### Providers / Services

Понимать:

* business logic;
* dependency injection;
* injectable services.

### Dependency Injection

Особенно важно благодаря Angular background.

Понимать:

* provider;
* token;
* dependency;
* singleton scope;
* request scope на базовом уровне.

### Guards

Уметь использовать для:

* authentication;
* authorization;
* RBAC.

### Pipes

Понимать:

* validation;
* transformation.

### Interceptors

Понимать:

* logging;
* response transformation;
* timing;
* cross-cutting concerns.

### Middleware

Понимать:

* что это;
* когда использовать;
* чем отличается от Guard/Interceptor.

### Exception Filters

Понимать:

* централизованную обработку HTTP exceptions;
* custom exceptions.

### Decorators

Понимать:

* framework decorators;
* custom decorators.

### Request lifecycle

Нужно уметь объяснить общий lifecycle запроса:

```text
Middleware
↓
Guards
↓
Interceptors
↓
Pipes
↓
Controller
↓
Service
↓
Interceptors
↓
Response
```

---

## 13. PostgreSQL / SQL

ORM не заменяет знания SQL.

### CRUD

Знать:

```sql
SELECT
INSERT
UPDATE
DELETE
```

### JOIN

Обязательно:

```text
INNER JOIN
LEFT JOIN
```

Понимать practical use cases.

### Aggregation

Знать:

```sql
COUNT
SUM
AVG
MIN
MAX
GROUP BY
HAVING
```

### Sorting / pagination

Знать:

```sql
ORDER BY
LIMIT
OFFSET
```

### Database structure

Понимать:

* primary key;
* foreign key;
* unique;
* constraints;
* indexes.

### Indexes

Понимать:

* зачем нужны;
* когда помогают;
* почему слишком много indexes плохо;
* влияние на writes.

### Transactions

Понимать:

```text
BEGIN
COMMIT
ROLLBACK
```

и атомарность операций.

### Isolation

Знать базовую идею transaction isolation.

### N+1

Уметь:

* определить N+1;
* объяснить проблему;
* предложить решение.

### Query performance

На базовом уровне уметь читать:

```sql
EXPLAIN
```

---

## 14. Prisma / ORM

Основной ORM учебного проекта может быть Prisma.

При этом архитектурные концепции должны быть переносимы на TypeORM.

### Нужно уметь

* schema;
* models;
* relations;
* migrations;
* CRUD;
* filtering;
* sorting;
* pagination;
* transactions.

### Relations

Понимать:

```text
one-to-one
one-to-many
many-to-many
```

### ORM limitations

Понимать:

> ORM не заменяет SQL.

Нужно понимать, какой SQL примерно генерируется под капотом.

### Connection pooling

Понимать:

* DB connections;
* connection pool;
* почему не нужно создавать новое connection на каждый request.

---

## 15. Authentication

### Passwords

Никогда не хранить:

```text
plain text password
```

Понимать:

* hashing;
* salt;
* bcrypt;
* Argon2.

### JWT

Понимать:

```text
login
↓
credentials validation
↓
JWT
↓
client
↓
Authorization header
↓
JWT verification
↓
protected endpoint
```

Понимать:

* payload;
* signature;
* expiration;
* verification.

### Access / Refresh tokens

Понимать:

* зачем access token;
* зачем refresh token;
* expiration;
* refresh flow;
* базовые проблемы token revocation.

---

## 16. Authorization

Понимать:

```text
Authentication
≠
Authorization
```

Authentication:

> Who are you?

Authorization:

> What are you allowed to do?

### RBAC

Уметь реализовать:

```text
ADMIN
MANAGER
USER
```

и защищать endpoints через Nest Guards.

### Permissions

Понимать:

```text
role → permissions
```

и когда permissions лучше простого role check.

---

## 17. Web Security

Обязательно понимать:

### XSS

Что это и как предотвращать.

### CSRF

Что это и когда актуально.

### SQL Injection

Понимать причину и почему parameterized queries/ORM помогают.

### CORS

Понимать реальные ограничения CORS.

### Secrets

Никогда не хранить:

```text
JWT_SECRET
DATABASE_PASSWORD
API_KEYS
```

в git.

Использовать environment/configuration management.

### Rate limiting

Понимать:

* зачем;
* где применять;
* что защищает.

### Backend validation

Frontend validation никогда не является достаточной защитой.

---

## 18. Validation

В NestJS изучить:

```text
DTO
ValidationPipe
class-validator
class-transformer
```

Уметь валидировать:

* required fields;
* types;
* strings;
* numbers;
* enums;
* nested objects;
* arrays.

Понимать:

> Backend обязан самостоятельно валидировать входные данные.

---

## 19. Error handling

Понимать:

* Error;
* custom errors;
* exception propagation;
* HTTP exceptions;
* global exception handling.

Уметь правильно различать:

```text
400
401
403
404
409
422
500
```

Не делать:

```ts
catch (error) {
  return null;
}
```

без понимания последствий.

### Logging

Понимать:

* structured logs;
* log levels;
* error context;
* correlation/request ID на базовом уровне.

---

## 20. Testing

### Unit

Тестировать:

* services;
* business logic;
* pure functions.

### Integration

Проверять:

* database;
* modules;
* real dependencies where appropriate.

### E2E

Проверять:

```text
HTTP request
↓
Nest
↓
service
↓
database
↓
HTTP response
```

### Tools

Знать:

```text
Jest
Supertest
Nest TestingModule
```

---

## 21. Redis

Необходимо понимать Redis на практическом уровне.

### Основные сценарии

* caching;
* sessions;
* rate limiting;
* temporary data.

### Cache

Понимать:

```text
request
↓
Redis
↓
cache hit
```

или:

```text
cache miss
↓
database
↓
Redis
↓
response
```

### Cache problems

Понимать:

* TTL;
* stale data;
* cache invalidation;
* cache stampede на базовом уровне.

---

## 22. Message Queues

Изучить концепции:

```text
RabbitMQ
Pub/Sub
```

Не обязательно знать оба глубоко.

Понимать:

* producer;
* consumer;
* queue;
* message;
* acknowledgement;
* retry;
* dead-letter queue;
* asynchronous processing.

Понимать зачем queue:

```text
HTTP request
↓
enqueue job
↓
return response

worker
↓
process job
```

---

## 23. Background processing

Уметь объяснить, почему тяжёлую работу не всегда нужно выполнять непосредственно внутри HTTP request.

Примеры:

* sending emails;
* generating reports;
* processing files;
* importing large datasets;
* external API synchronization.

Понимать:

```text
API
↓
Queue
↓
Worker
↓
Database / external service
```

---

## 24. Performance

### Event Loop

Не блокировать его CPU-heavy синхронным кодом.

### Database

Понимать:

* indexes;
* N+1;
* unnecessary queries;
* pagination;
* connection pooling.

### Cache

Понимать, когда использовать Redis.

### Pagination

Не возвращать огромные datasets одним HTTP response.

### Worker Threads

Знать, что Worker Threads подходят для некоторых CPU-heavy задач.

Не использовать Worker Threads для обычного async I/O.

---

## 25. Scaling

Понимать:

```text
Client
 ↓
Load Balancer
 ↓
API instance
API instance
API instance
 ↓
Shared DB / Redis
```

### Stateless backend

Понимать почему backend желательно делать stateless.

### Horizontal scaling

Понимать:

```text
1 instance
↓
N instances
```

и какие проблемы возникают с:

* local memory;
* sessions;
* cache;
* uploaded files.

---

## 26. Docker

Уметь:

* написать базовый Dockerfile;
* собрать Node/Nest image;
* запустить container;
* пробросить port;
* передать env variables.

### Docker Compose

Уметь поднять:

```text
NestJS
PostgreSQL
Redis
```

одной командой.

Понимать:

* containers;
* images;
* volumes;
* networks;
* ports.

---

## 27. Architecture

Базовая архитектура:

```text
Controller
    ↓
Service
    ↓
ORM / Repository
    ↓
Database
```

Понимать separation of concerns.

### Controller

HTTP concerns.

### Service

Business logic.

### ORM/Repository

Data access.

### Database

Persistence.

Не смешивать всё в Controller.

Но также не создавать 10 абстракций вокруг простой CRUD операции.

---

## 28. Microservices

Нужно понимать концептуально:

```text
Monolith
vs
Microservices
```

Знать:

* service;
* communication;
* API;
* queues;
* independent deployment;
* service boundaries.

Понимать trade-offs.

Не считать microservices автоматически более правильной архитектурой.

Для учебного проекта сначала использовать modular monolith.

---

## 29. Cloud / GCP — после основной Node базы

Для вакансий с GCP дополнительно изучить:

### Cloud Functions

Понимать:

* function;
* trigger;
* HTTP trigger;
* logs;
* monitoring;
* deployment.

### Firestore

Понимать:

* documents;
* collections;
* queries;
* indexes;
* data modeling.

### Cloud Storage

Понимать:

* buckets;
* objects;
* upload/download;
* permissions.

### Secret Manager

Понимать безопасное хранение secrets.

### Pub/Sub

Понимать:

```text
publisher
↓
topic
↓
subscription
↓
consumer
```

---

## 30. AdTech-specific knowledge

Не является обязательным для базового Middle Node.js.

Но для AdTech вакансий желательно понимать:

```text
campaign
budget
impression
click
conversion
pixel
CPC
CPA
ROAS
```

Также полезно знать концепцию:

```text
Ad Platform API
↓
data ingestion
↓
processing
↓
storage
↓
analytics
↓
dashboard
```
