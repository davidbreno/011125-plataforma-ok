import { useState, useEffect } from 'react'

// Cache em memória para dados do Firestore
const memoryCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useFirestoreCache(key, fetchFunction, dependencies = []) {
  const [data, setData] = useState(() => {
    // Tentar obter do cache de memória primeiro
    const cached = memoryCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    
    // Tentar obter do localStorage
    try {
      const localData = localStorage.getItem(`cache_${key}`)
      if (localData) {
        const parsed = JSON.parse(localData)
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          memoryCache.set(key, parsed)
          return parsed.data
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage cache:', e)
    }
    
    return null
  })
  
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        // Se já temos dados em cache válidos, não buscar novamente
        const cached = memoryCache.get(key)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return
        }

        setLoading(true)
        const result = await fetchFunction()
        
        if (isMounted) {
          const cacheEntry = {
            data: result,
            timestamp: Date.now()
          }
          
          // Salvar em memória
          memoryCache.set(key, cacheEntry)
          
          // Salvar em localStorage (tentar, mas não bloquear se falhar)
          try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry))
          } catch (e) {
            console.warn('localStorage full, cache not saved:', e)
          }
          
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching data:', err)
          setError(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  // Função para invalidar cache manualmente
  const invalidateCache = () => {
    memoryCache.delete(key)
    localStorage.removeItem(`cache_${key}`)
    setData(null)
    setLoading(true)
  }

  // Função para atualizar cache manualmente
  const updateCache = (newData) => {
    const cacheEntry = {
      data: newData,
      timestamp: Date.now()
    }
    
    memoryCache.set(key, cacheEntry)
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry))
    } catch (e) {
      console.warn('localStorage full, cache not saved:', e)
    }
    setData(newData)
  }

  return { data, loading, error, invalidateCache, updateCache }
}

// Função para limpar todo o cache
export function clearAllCache() {
  memoryCache.clear()
  
  // Limpar apenas keys de cache do localStorage
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key)
    }
  })
}
