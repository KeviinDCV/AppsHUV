// Servicio simplificado para conexión en tiempo real con Notion
// Versión que funciona inmediatamente con datos mock y polling simulado

class NotionRealTimeService {
  constructor() {
    this.applications = []
    this.listeners = new Set()
    this.isConnected = false
    this.lastUpdateTime = null
    this.pollingInterval = null
    this.updateCounter = 0
    
    this.init()
  }

  async init() {
    console.log('🚀 Inicializando servicio de Notion en tiempo real...')

    // Cargar datos mock inmediatamente para que la app funcione
    await this.loadMockData()

    // Luego intentar conectar con Notion real en segundo plano
    setTimeout(async () => {
      try {
        console.log('🔗 Intentando conectar con Notion API...')
        await this.loadFromNotionAPI()
      } catch (error) {
        console.warn('⚠️ Error al conectar con Notion (probablemente CORS):', error.message)
        console.log('📦 Continuando con datos mock')
      }
    }, 2000)

    // Simular conexión en tiempo real
    this.simulateRealTimeConnection()

    // Configurar polling
    this.startPolling()
  }

  // Cargar desde la API real de Notion
  async loadFromNotionAPI() {
    console.log('🔗 Conectando con Notion API...')

    const NOTION_TOKEN = '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'
    const DATABASE_ID = '21d8c043c53781d080b8fa8e6a660bc8'

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
    console.log('📊 Datos recibidos de Notion:', data)

    const applications = this.parseNotionData(data.results)

    this.applications = applications
    this.lastUpdateTime = new Date().toISOString()

    console.log(`✅ Cargadas ${applications.length} aplicaciones desde Notion`)
    this.notifyListeners('data_loaded', this.applications)
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
    }).filter(app => app.title) // Filtrar aplicaciones sin título
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

  async loadMockData() {
    console.log('📦 Cargando datos mock como fallback...')
    
    // Datos mock que simulan la estructura de Notion
    this.applications = [
      {
        id: "notion-1",
        title: "CUVS - Analytics",
        description: "Sistema de visualización de métricas y datos en tiempo real del hospital",
        category: "administrativo",
        icon: "📊",
        url: "https://cuvs.huv.com",
        color: "bg-blue-500",
        order: 1,
        status: "active",
        published: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "notion-2", 
        title: "Historia Clínica Electrónica",
        description: "Sistema integral para el manejo de historias clínicas digitales",
        category: "clinico",
        icon: "🏥",
        url: "https://hce.huv.gov.co",
        color: "bg-green-500",
        order: 2,
        status: "active",
        published: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "notion-3",
        title: "Laboratorio Clínico",
        description: "Sistema de gestión de laboratorio con resultados en línea",
        category: "laboratorio", 
        icon: "🔬",
        url: "https://laboratorio.huv.gov.co",
        color: "bg-red-500",
        order: 3,
        status: "active",
        published: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "notion-4",
        title: "Farmacia Hospitalaria",
        description: "Control de inventario farmacéutico y dispensación de medicamentos",
        category: "farmacia",
        icon: "💊", 
        url: "https://farmacia.huv.gov.co",
        color: "bg-purple-500",
        order: 4,
        status: "active",
        published: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "notion-5",
        title: "Radiología e Imágenes",
        description: "Visualización y gestión de imágenes médicas con herramientas avanzadas",
        category: "radiologia",
        icon: "📸",
        url: "https://radiologia.huv.gov.co", 
        color: "bg-cyan-500",
        order: 5,
        status: "active",
        published: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "notion-6",
        title: "Gestión de Citas",
        description: "Sistema de agendamiento y gestión de citas médicas para pacientes",
        category: "administrativo",
        icon: "📅",
        url: "https://citas.huv.gov.co",
        color: "bg-orange-500", 
        order: 6,
        status: "active",
        published: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "notion-7",
        title: "Telemedicina",
        description: "Plataforma de consultas médicas virtuales y seguimiento remoto",
        category: "clinico",
        icon: "💻",
        url: "https://telemedicina.huv.gov.co",
        color: "bg-teal-500",
        order: 7,
        status: "active", 
        published: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "notion-8",
        title: "Recursos Humanos",
        description: "Gestión integral del talento humano y nómina del hospital",
        category: "recursos",
        icon: "👥",
        url: "https://rrhh.huv.gov.co",
        color: "bg-indigo-500",
        order: 8,
        status: "active",
        published: true,
        lastUpdated: new Date().toISOString()
      }
    ]

    this.lastUpdateTime = new Date().toISOString()
    console.log(`✅ Cargadas ${this.applications.length} aplicaciones`)
    this.notifyListeners('data_loaded', this.applications)
  }

  simulateRealTimeConnection() {
    // Simular conexión exitosa después de 2 segundos
    setTimeout(() => {
      this.isConnected = true
      console.log('✅ Conectado a Notion en tiempo real (simulado)')
      this.notifyListeners('connected')
    }, 2000)
  }

  startPolling() {
    // Polling real cada 10 segundos
    this.pollingInterval = setInterval(async () => {
      try {
        console.log('🔄 Verificando actualizaciones en Notion...')
        await this.loadFromNotionAPI()
      } catch (error) {
        console.warn('⚠️ Error en polling:', error.message)
        // Si falla, continuar con datos actuales
      }
    }, 10000)

    console.log('🔄 Polling iniciado (cada 10 segundos)')
  }

  simulateUpdate() {
    this.updateCounter++
    
    // Simular diferentes tipos de actualizaciones
    const updateTypes = [
      () => this.addNewApplication(),
      () => this.updateExistingApplication(),
      () => this.changeApplicationStatus()
    ]
    
    // Ejecutar actualización aleatoria cada 3 ciclos
    if (this.updateCounter % 3 === 0) {
      const randomUpdate = updateTypes[Math.floor(Math.random() * updateTypes.length)]
      randomUpdate()
    }
  }

  addNewApplication() {
    const newApp = {
      id: `notion-new-${Date.now()}`,
      title: `Nueva Aplicación ${this.updateCounter}`,
      description: "Aplicación agregada en tiempo real desde Notion",
      category: "sistemas",
      icon: "🆕",
      url: "https://nueva.huv.gov.co",
      color: "bg-emerald-500",
      order: this.applications.length + 1,
      status: "active",
      published: true,
      lastUpdated: new Date().toISOString()
    }

    this.applications.push(newApp)
    this.lastUpdateTime = new Date().toISOString()
    
    console.log('🆕 Nueva aplicación agregada en tiempo real')
    this.notifyListeners('data_updated', this.applications)
  }

  updateExistingApplication() {
    if (this.applications.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * this.applications.length)
    const app = this.applications[randomIndex]
    
    app.description = `${app.description} (Actualizado: ${new Date().toLocaleTimeString()})`
    app.lastUpdated = new Date().toISOString()
    
    this.lastUpdateTime = new Date().toISOString()
    
    console.log(`🔄 Aplicación "${app.title}" actualizada en tiempo real`)
    this.notifyListeners('data_updated', this.applications)
  }

  changeApplicationStatus() {
    // Simular cambio de estado (no implementado para mantener estabilidad)
    console.log('📝 Cambio de estado simulado')
  }

  // Métodos de la interfaz pública
  addListener(callback) {
    console.log(`📝 Agregando listener. Total listeners: ${this.listeners.size + 1}`)
    this.listeners.add(callback)

    // Si ya tenemos datos, notificar inmediatamente
    if (this.applications.length > 0) {
      console.log(`📤 Notificando datos existentes: ${this.applications.length} aplicaciones`)
      callback('data_loaded', this.applications)
    }
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }

  notifyListeners(event, data = null) {
    console.log(`📢 Notificando evento: ${event} a ${this.listeners.size} listeners`)
    this.listeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('❌ Error en listener:', error)
      }
    })
  }

  getApplications() {
    return this.applications
  }

  getApplicationsByCategory(category) {
    if (category === 'all') {
      return this.applications
    }
    return this.applications.filter(app => app.category === category)
  }

  searchApplications(query) {
    if (!query) return this.applications
    
    const searchTerm = query.toLowerCase()
    return this.applications.filter(app => 
      app.title.toLowerCase().includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm)
    )
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      lastUpdateTime: this.lastUpdateTime,
      applicationCount: this.applications.length
    }
  }

  destroy() {
    console.log('🧹 Limpiando servicio de Notion...')
    
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
const notionRealTimeService = new NotionRealTimeService()

export default notionRealTimeService
