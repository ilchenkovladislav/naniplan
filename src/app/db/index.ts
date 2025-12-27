import type { Plan, PlanInput, PlanUpdate } from './types.ts'

const DB_NAME = 'PlansDB'
const DB_VERSION = 1
const STORE_NAME = 'plans'

// ============================================
// Инициализация базы данных
// ============================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error(`Ошибка открытия БД: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Создаём хранилище, если его нет
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })

        // Индексы для быстрого поиска
        store.createIndex('key', 'key', { unique: true })
        store.createIndex('type', 'type', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('key_type', ['key', 'type'], { unique: false })
      }
    }
  })
}

// ============================================
// CREATE - Создание записи
// ============================================

async function createPlan(plan: PlanInput): Promise<Plan> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const request = store.add(plan)

    request.onsuccess = () => {
      resolve({ ...plan, id: request.result as number })
    }

    request.onerror = () => {
      reject(new Error(`Ошибка создания: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Массовое создание записей
async function createManyPlans(plans: PlanInput[]): Promise<Plan[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const results: Plan[] = []

    plans.forEach((plan, index) => {
      const request = store.add(plan)

      request.onsuccess = () => {
        results[index] = { ...plan, id: request.result as number }
      }

      request.onerror = () => {
        reject(new Error(`Ошибка создания записи ${index}`))
      }
    })

    transaction.oncomplete = () => {
      db.close()
      resolve(results)
    }

    transaction.onerror = () => {
      reject(new Error('Ошибка транзакции'))
    }
  })
}

// ============================================
// READ - Чтение записей
// ============================================

// Получить по ID
async function getPlanById(id: number): Promise<Plan | undefined> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`Ошибка чтения: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Получить все записи
async function getAllPlans(): Promise<Plan[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`Ошибка чтения: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Получить по типу
async function getPlansByType(type: Plan['type']): Promise<Plan[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('type')
    const request = index.getAll(type)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`Ошибка чтения: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Получить по ключу
async function getPlansByKey(key: string): Promise<Plan[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('key')
    const request = index.getAll(key)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`Ошибка чтения: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Получить по ключу и типу
async function getPlanByKeyAndType(key: string, type: Plan['type']): Promise<Plan | undefined> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('key_type')
    const request = index.get([key, type])

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`Ошибка чтения: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Получить за период времени
async function getPlansByTimeRange(from: number, to: number): Promise<Plan[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('timestamp')
    const range = IDBKeyRange.bound(from, to)
    const request = index.getAll(range)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`Ошибка чтения: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// ============================================
// UPDATE - Обновление записи
// ============================================

async function updatePlan(update: PlanUpdate): Promise<Plan> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    // Сначала получаем существующую запись
    const getRequest = store.get(update.id)

    getRequest.onsuccess = () => {
      const existing = getRequest.result

      if (!existing) {
        reject(new Error(`План с id ${update.id} не найден`))
        return
      }

      // Объединяем существующие данные с обновлениями
      const updated: Plan = { ...existing, ...update }
      const putRequest = store.put(updated)

      putRequest.onsuccess = () => {
        resolve(updated)
      }

      putRequest.onerror = () => {
        reject(new Error(`Ошибка обновления: ${putRequest.error?.message}`))
      }
    }

    getRequest.onerror = () => {
      reject(new Error(`Ошибка поиска: ${getRequest.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Полная замена записи
async function replacePlan(plan: Plan): Promise<Plan> {
  if (!plan.id) {
    throw new Error('ID обязателен для замены')
  }

  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(plan)

    request.onsuccess = () => {
      resolve(plan)
    }

    request.onerror = () => {
      reject(new Error(`Ошибка замены: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// ============================================
// DELETE - Удаление записей
// ============================================

async function deletePlan(id: number): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error(`Ошибка удаления: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Удалить несколько записей
async function deleteManyPlans(ids: number[]): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    ids.forEach((id) => {
      store.delete(id)
    })

    transaction.oncomplete = () => {
      db.close()
      resolve()
    }

    transaction.onerror = () => {
      reject(new Error('Ошибка удаления'))
    }
  })
}

// Удалить все записи
async function deleteAllPlans(): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error(`Ошибка очистки: ${request.error?.message}`))
    }

    transaction.oncomplete = () => db.close()
  })
}

// Удалить по типу
async function deletePlansByType(type: Plan['type']): Promise<void> {
  const plans = await getPlansByType(type)
  const ids = plans.map((p) => p.id!).filter(Boolean)
  await deleteManyPlans(ids)
}

// ============================================
// Экспорт
// ============================================

export {
  // Types
  type Plan,
  type PlanInput,
  type PlanUpdate,

  // Create
  createPlan,
  createManyPlans,

  // Read
  getPlanById,
  getAllPlans,
  getPlansByType,
  getPlansByKey,
  getPlanByKeyAndType,
  getPlansByTimeRange,

  // Update
  updatePlan,
  replacePlan,

  // Delete
  deletePlan,
  deleteManyPlans,
  deleteAllPlans,
  deletePlansByType,
}
