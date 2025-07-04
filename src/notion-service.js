// Servicio para conexión en tiempo real con Notion
// Maneja WebSocket, polling y cache local

class NotionService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api'
    this.wsUrl = 'ws://localhost:3001'
    this.ws = null
    this.applications = []
    this.listeners = new Set()
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.pollingInterval = null
    this.lastUpdateTime = null
    this.useDirectNotionAPI = true // Usar API directa por ahora

    this.init()
  }

  // Inicializar el servicio
  async init() {
    console.log('🚀 Inicializando servicio de Notion...')

    try {
      if (this.useDirectNotionAPI) {
        // Intentar conexión directa con Notion API
        await this.loadFromNotionDirect()
      } else {
        // Cargar datos desde backend
        await this.loadInitialData()

        // Conectar WebSocket
        this.connectWebSocket()

        // Configurar polling como fallback
        this.startPolling()
      }

    } catch (error) {
      console.error('❌ Error al inicializar servicio de Notion:', error)
      // Usar datos mock como fallback
      this.loadMockData()
    }
  }

  // Cargar datos iniciales desde el backend
  async loadInitialData() {
    try {
      console.log('📥 Cargando datos iniciales...')
      
      const response = await fetch(`${this.baseUrl}/applications`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        this.applications = result.data
        this.lastUpdateTime = result.lastUpdated
        console.log(`✅ Cargadas ${result.count} aplicaciones desde Notion`)
        this.notifyListeners('data_loaded', this.applications)
      } else {
        throw new Error(result.error || 'Error al cargar datos')
      }
      
    } catch (error) {
      console.error('❌ Error al cargar datos iniciales:', error)
      throw error
    }
  }

  // Conectar WebSocket para actualizaciones en tiempo real
  connectWebSocket() {
    try {
      console.log('🔌 Conectando WebSocket...')
      
      this.ws = new WebSocket(this.wsUrl)
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.notifyListeners('connected')
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleWebSocketMessage(message)
        } catch (error) {
          console.error('❌ Error al procesar mensaje WebSocket:', error)
        }
      }
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket desconectado')
        this.isConnected = false
        this.notifyListeners('disconnected')
        this.scheduleReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error)
        this.notifyListeners('error', error)
      }
      
    } catch (error) {
      console.error('❌ Error al conectar WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  // Manejar mensajes del WebSocket
  handleWebSocketMessage(message) {
    console.log('📨 Mensaje WebSocket recibido:', message.type)
    
    switch (message.type) {
      case 'initial_data':
        if (message.data && message.data.length > 0) {
          this.applications = message.data
          this.lastUpdateTime = message.timestamp
          this.notifyListeners('data_loaded', this.applications)
        }
        break
        
      case 'applications_updated':
        console.log('🔄 Aplicaciones actualizadas en tiempo real')
        this.applications = message.data
        this.lastUpdateTime = message.timestamp
        this.notifyListeners('data_updated', this.applications)
        break
        
      default:
        console.log('📨 Mensaje WebSocket no reconocido:', message.type)
    }
  }

  // Programar reconexión automática
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión alcanzado')
      return
    }
    
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connectWebSocket()
    }, delay)
  }

  // Iniciar polling como fallback
  startPolling() {
    // Verificar cambios cada 10 segundos
    this.pollingInterval = setInterval(async () => {
      if (!this.isConnected) {
        await this.checkForUpdates()
      }
    }, 10000)
    
    console.log('🔄 Polling iniciado (cada 10 segundos)')
  }

  // Verificar actualizaciones manualmente
  async checkForUpdates() {
    try {
      const response = await fetch(`${this.baseUrl}/check-updates`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.hasChanges) {
        console.log('🔄 Cambios detectados via polling')
        this.applications = result.data
        this.lastUpdateTime = result.lastUpdated
        this.notifyListeners('data_updated', this.applications)
      }
      
    } catch (error) {
      console.error('❌ Error al verificar actualizaciones:', error)
    }
  }

  // Cargar directamente desde Notion API
  async loadFromNotionDirect() {
    console.log('🔗 Intentando conexión directa con Notion API...')

    const NOTION_TOKEN = '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'
    const DATABASE_ID = '21d8c043c53781d080b8fa8e6a660bc8'

    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          filter: {
            and: [
              {
                property: 'Status',
                select: {
                  equals: 'active'
                }
              },
              {
                property: 'Published',
                checkbox: {
                  equals: true
                }
              }
            ]
          },
          sorts: [
            {
              property: 'Order',
              direction: 'ascending'
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const applications = this.parseNotionData(data.results)

      this.applications = applications
      this.lastUpdateTime = new Date().toISOString()
      this.isConnected = true

      console.log(`✅ Cargadas ${applications.length} aplicaciones desde Notion API`)
      this.notifyListeners('data_loaded', this.applications)
      this.notifyListeners('connected')

      // Configurar polling para actualizaciones
      this.startDirectPolling()

    } catch (error) {
      console.warn('⚠️ Error en conexión directa con Notion (probablemente CORS):', error.message)
      throw error
    }
  }

  // Parsear datos de Notion
  parseNotionData(results) {
    return results.map((page, index) => {
      const props = page.properties

      return {
        id: page.id,
        title: this.getPropertyValue(props.Name || props.Title),
        description: this.getPropertyValue(props.Description),
        category: this.mapNotionCategoryToLocal(this.getPropertyValue(props.Category)),
        icon: this.getPropertyValue(props.Icon) || '📱',
        url: this.getPropertyValue(props.URL),
        color: this.getPropertyValue(props.Color) || 'bg-blue-500',
        order: this.getPropertyValue(props.Order) || index + 1,
        status: this.getPropertyValue(props.Status),
        published: this.getPropertyValue(props.Published),
        lastUpdated: page.last_edited_time,
        originalCategory: this.getPropertyValue(props.Category)
      }
    })
  }

  // Extraer valores de propiedades de Notion
  getPropertyValue(property) {
    if (!property) return ''

    switch (property.type) {
      case 'title':
        return property.title?.[0]?.plain_text || ''
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || ''
      case 'select':
        return property.select?.name || ''
      case 'checkbox':
        return property.checkbox || false
      case 'url':
        return property.url || ''
      case 'number':
        return property.number || 0
      case 'date':
        return property.date?.start || ''
      default:
        return ''
    }
  }

  // Mapear categorías de Notion a categorías locales
  mapNotionCategoryToLocal(notionCategory) {
    const categoryMap = {
      'Clinical': 'clinico',
      'Administrative': 'administrativo',
      'Laboratory': 'laboratorio',
      'Radiology': 'radiologia',
      'Pharmacy': 'farmacia',
      'HR': 'recursos',
      'Systems': 'sistemas',
      'Analytics': 'administrativo',
      'Project Management': 'administrativo'
    }
    return categoryMap[notionCategory] || 'administrativo'
  }

  // Polling directo para actualizaciones
  startDirectPolling() {
    this.pollingInterval = setInterval(async () => {
      try {
        await this.loadFromNotionDirect()
      } catch (error) {
        console.warn('⚠️ Error en polling directo:', error.message)
      }
    }, 10000) // Cada 10 segundos

    console.log('🔄 Polling directo iniciado (cada 10 segundos)')
  }

  // Cargar datos mock como fallback
  loadMockData() {
    console.log('📦 Cargando datos mock como fallback')

    // Importar datos mock desde applications.js
    import('./applications.js').then(module => {
      this.applications = module.getApplications()
      this.notifyListeners('data_loaded', this.applications)
    }).catch(error => {
      console.error('❌ Error al cargar datos mock:', error)
    })
  }

  // Agregar listener para eventos
  addListener(callback) {
    this.listeners.add(callback)
    
    // Si ya tenemos datos, notificar inmediatamente
    if (this.applications.length > 0) {
      callback('data_loaded', this.applications)
    }
  }

  // Remover listener
  removeListener(callback) {
    this.listeners.delete(callback)
  }

  // Notificar a todos los listeners
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('❌ Error en listener:', error)
      }
    })
  }

  // Obtener aplicaciones actuales
  getApplications() {
    return this.applications
  }

  // Obtener aplicaciones por categoría
  getApplicationsByCategory(category) {
    if (category === 'all') {
      return this.applications
    }
    return this.applications.filter(app => app.category === category)
  }

  // Buscar aplicaciones
  searchApplications(query) {
    if (!query) return this.applications
    
    const searchTerm = query.toLowerCase()
    return this.applications.filter(app => 
      app.title.toLowerCase().includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm)
    )
  }

  // Obtener estado de conexión
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      lastUpdateTime: this.lastUpdateTime,
      applicationCount: this.applications.length
    }
  }

  // Limpiar recursos
  destroy() {
    console.log('🧹 Limpiando servicio de Notion...')
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    
    this.listeners.clear()
    this.applications = []
    this.isConnected = false
  }
}

// Crear instancia singleton
const notionService = new NotionService()

export default notionService
