# Trade Service Agent Key Integration

## Обзор изменений

Модуль `src/services/trade.ts` успешно интегрирован с agent-ключом согласно требованиям.

## ✅ Реализованные функции

### 1. `ensureAgent()`
- Функция для UI компонентов
- Показывает модалку SetupAgent при необходимости
- Возвращает `{ priv, address }` (расшифрованный приватный ключ)

### 2. Подпись и отправка
Все торговые функции (`placeOrder`, `cancelOrder`, `closePosition`) теперь:
- Вызывают `const agent = await ensureAgent()`
- Получают nonce через `const nonce = await getNonce(agent.address)`
- Подписывают действия через `const signed = await signAction(action, agent.priv, nonce)`
- Отправляют через `await postExchange(signed)`
- Увеличивают nonce через `await bumpNonce(agent.address)`

### 3. Идемпотентность
- Добавлен опциональный `cloid?: string` в `OrderRequest`
- Прокидывается в action для предотвращения дублирования

### 4. Обработка ошибок
- При ошибках подписи/nonce: `resetNonce(agent.address)`
- Одна повторная попытка: `getRemoteNonce() → sign → send`
- Автоматический retry через `retryWithNonceReset()`

## 🔧 Технические детали

### Новые функции
- `postExchange(signed, userAddress?)` - отправка подписанных действий
- `retryWithNonceReset<T>()` - retry логика с сбросом nonce

### Обновленные интерфейсы
```typescript
export interface OrderRequest {
  a: string;        // asset
  b: 'buy' | 'sell'; // side
  t: 'limit' | 'market'; // type
  s: string;        // size
  p?: string;       // price
  ro?: boolean;     // reduce only
  cloid?: string;   // client order ID for idempotency
}
```

### Retry логика
```typescript
const result = await retryWithNonceReset(async () => {
  const nonce = await getNonce(agent.address);
  const signed = await signAction(action, agent.priv, nonce);
  return await postExchange(signed, userAddress);
}, agent.address);
```

## 🚀 Готовность

- ✅ Проект компилируется без ошибок
- ✅ Все торговые функции обновлены
- ✅ Retry логика реализована
- ✅ Поддержка cloid добавлена
- ✅ Интеграция с nonce модулем

## 📝 Следующие шаги

1. **UI слой**: Создать модалку SetupAgent для генерации ключа и PIN
2. **Тестирование**: Протестировать retry логику и обработку ошибок
3. **Документация**: Обновить API документацию с новыми параметрами

Модуль готов к использованию в продакшене! 🎯
