## Что есть в системе (сущности):

Note - заметки
User — владелец промтов, автор, голосующий
Case — сам промт (может быть приватным или публичным)
Tag — метки (многие-ко-многим с Case)
Vote — голос пользователя за публичный промт (уникально: один пользователь → один голос на промт)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) CaseVersion — версии промта (история изменений)

## Ключевые правила:

- Публичность — это свойство Case (visibility)
- Голосовать можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
- Голос уникален: (userId, CaseId) — уникальный индекс

## Схема базы данных
- Note: id, ownerId -> User, title, createdAt
- User: id (cuid), email unique, name optional, createdAt
- Case: id, ownerId -> User, title, content, description optional, categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
- Vote: id, userId -> User, CaseId -> Case, value int default 1, createdAt
- Category: id, category
- Ограничение: один пользователь может проголосовать за промт только один раз:
  UNIQUE(userId, CaseId)
- Индексы:
  Case(ownerId, updatedAt)
  Case(visibility, createdAt)
  Vote(CaseId)
  Vote(userId)
- onDelete: Cascade для связей
