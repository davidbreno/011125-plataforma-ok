/**
 * Configurações de Performance do Firestore
 * 
 * Este arquivo contém configurações para otimizar a performance
 * do Firestore, incluindo estratégias de cache e batch operations.
 */

import { writeBatch, enableIndexedDbPersistence } from 'firebase/firestore'
import { db } from './config'

// Habilitar persistência offline (cache local)
export async function enableOfflinePersistence() {
  try {
    await enableIndexedDbPersistence(db)
    console.log('✅ Firestore offline persistence enabled')
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ The current browser does not support offline persistence')
    }
  }
}

/**
 * Batch write operation para salvar múltiplos documentos de uma vez
 * Mais rápido que salvar um por um
 */
export function createBatchOperation() {
  return writeBatch(db)
}

/**
 * Configurações recomendadas para queries
 */
export const QUERY_LIMITS = {
  DEFAULT: 50,        // Limite padrão para listagens
  SEARCH: 20,         // Limite para buscas
  RECENT: 10,         // Limite para itens recentes
  PAGINATION: 25      // Tamanho da página para paginação
}

/**
 * Tempo de cache em milissegundos
 */
export const CACHE_DURATION = {
  SHORT: 1 * 60 * 1000,      // 1 minuto
  MEDIUM: 5 * 60 * 1000,     // 5 minutos  
  LONG: 15 * 60 * 1000,      // 15 minutos
  VERY_LONG: 60 * 60 * 1000  // 1 hora
}

/**
 * Debounce para operações de busca
 * Evita múltiplas queries enquanto o usuário digita
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle para limitar frequência de chamadas
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
