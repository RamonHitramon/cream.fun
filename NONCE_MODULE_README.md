# Nonce Management Module

Модуль `src/services/nonce.ts` для управления nonce в Hyperliquid trading.

## Основные функции

### `getRemoteNonce(agentAddress: string): Promise<number>`
- Запрашивает текущий nonce у Hyperliquid через `/info` эндпоинт
- Использует `type: 'userState'` для получения nonce пользователя
- Логирует с префиксом `[HL NONCE]`

### `getNonce(agentAddress: string): Promise<number>`
- **Lazy loading стратегия:**
  1. Проверяет in-memory кэш
  2. Проверяет persistent storage (IndexedDB)
  3. Если нет локального значения → запрашивает удалённый, сохраняет локально
- Возвращает локальное значение

### `bumpNonce(agentAddress: string): Promise<number>`
- Увеличивает nonce на +1 после успешного `/exchange` вызова
- Обновляет и memory cache, и persistent storage
- Логирует изменение: `old → new`

### `resetNonce(agentAddress: string): Promise<void>`
- Обнуляет локальное состояние для конкретного адреса
- Удаляет из memory cache и IndexedDB

### `resetAllNonces(): Promise<void>`
- Полное обнуление всех nonce состояний

## Вспомогательные функции

### `getCachedNonce(agentAddress: string): number | null`
- Получает nonce только из кэша (без запроса к API)

### `hasCachedNonce(agentAddress: string): boolean`
- Проверяет наличие nonce в кэше

### `getNonceInfo(agentAddress: string): NonceResponse | null`
- Получает полную информацию о nonce для отладки

## Хранилище

- **Memory Cache**: Быстрый доступ к недавно использованным nonce
- **IndexedDB**: Persistent storage с именем `hl_nonce_db`
- **Store**: `nonces` с keyPath `address`

## Логирование

Все логи имеют префикс `[HL NONCE]` и не содержат секретных данных:
- Адреса обрезаются до 20 символов + `...`
- Nonce значения логируются
- Ошибки детализированы

## Интеграция

Модуль интегрирован с:
- `src/config/hyperliquid.ts` - для получения URL эндпоинтов
- `src/services/trade.ts` - для получения nonce при торговых операциях

## Типы

```typescript
interface NonceResponse {
  nonce: number;
  timestamp: number;
}

interface NonceCache {
  [agentAddress: string]: NonceResponse;
}
```

## Пример использования

```typescript
import { getNonce, bumpNonce } from '@/services/nonce';

// Получить nonce (lazy loading)
const nonce = await getNonce('0x1234...');

// Увеличить после успешной операции
await bumpNonce('0x1234...');

// Сбросить состояние
await resetNonce('0x1234...');
```
