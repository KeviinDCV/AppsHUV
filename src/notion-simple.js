// Servicio simplificado que funciona inmediatamente
// Conecta con Notion y maneja fallback automáticamente

class SimpleNotionService {
  constructor() {
    this.applications = []
    this.listeners = new Set()
    this.isConnected = false
    this.lastUpdateTime = null
    this.pollingInterval = null
    
    // Inicializar inmediatamente con datos
    this.initializeImmediately()
  }

  initializeImmediately() {
    console.log('🚀 Inicializando servicio de Notion...')

    // NO cargar datos mock - solo intentar Notion real
    console.log('🔗 Conectando directamente con Notion...')

    // Intentar conectar con Notion inmediatamente
    this.tryNotionConnection()
  }

  // Este método ya no se usa - solo datos reales de Notion

  async tryNotionConnection() {
    console.log('🔗 Conectando con Notion a través de proxy local...')

    try {
      // Primero intentar con el backend proxy local
      let response = await fetch('http://localhost:3001/api/applications')

      if (!response.ok) {
        console.log('⚠️ Backend proxy no disponible, intentando conexión directa...')
        // Si el backend no está disponible, intentar conexión directa
        response = await this.tryDirectNotionConnection()
      }

      if (response && response.ok) {
        const data = await response.json()
        console.log('✅ Datos recibidos:', data)

        let applications = []

        if (data.success && data.data) {
          // Respuesta del backend proxy
          applications = data.data
        } else if (data.results) {
          // Respuesta directa de Notion
          applications = this.parseNotionData(data.results)
        }

        if (applications.length > 0) {
          this.applications = applications
          this.lastUpdateTime = new Date().toISOString()
          this.isConnected = true

          console.log(`✅ ${applications.length} aplicaciones cargadas desde Notion`)
          this.notifyListeners('data_loaded', this.applications)
          this.notifyListeners('connected')
        } else {
          throw new Error('No se encontraron aplicaciones')
        }
      } else {
        throw new Error('No se pudo conectar con ningún método')
      }

    } catch (error) {
      console.error('❌ Error al conectar con Notion:', error.message)
      console.log('📦 Mostrando mensaje de error - NO hay aplicaciones mock')

      // NO cargar datos mock - mostrar error
      this.applications = []
      this.isConnected = false
      this.notifyListeners('error', 'No se pudo conectar con Notion. Verifica la conexión.')
    }
  }

  async tryDirectNotionConnection() {
    const NOTION_TOKEN = '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'
    const DATABASE_ID = '21d8c043c53781d080b8fa8e6a660bc8'

    return await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
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
            }
          ]
        }
      })
    })
  }

  parseNotionData(results) {
    return results.map((page, index) => {
      const props = page.properties
      
      return {
        id: page.id,
        title: this.getPropertyValue(props.Name || props.Title) || `App ${index + 1}`,
        description: this.getPropertyValue(props.Description) || 'Aplicación del hospital',
        category: this.mapCategory(this.getPropertyValue(props.Category)),
        icon: this.getPropertyValue(props.Icon) || '📱',
        url: this.getPropertyValue(props.URL) || '#',
        color: this.getPropertyValue(props.Color) || 'bg-blue-500',
        order: this.getPropertyValue(props.Order) || index + 1,
        status: this.getPropertyValue(props.Status) || 'active',
        published: this.getPropertyValue(props.Published) !== false,
        lastUpdated: page.last_edited_time || new Date().toISOString()
      }
    }).filter(app => app.title && app.title !== `App ${0}`)
  }

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
        return property.checkbox
      case 'url':
        return property.url || ''
      case 'number':
        return property.number || 0
      default:
        return ''
    }
  }

  mapCategory(category) {
    const map = {
      'Clinical': 'clinico',
      'Administrative': 'administrativo',
      'Laboratory': 'laboratorio',
      'Radiology': 'radiologia',
      'Pharmacy': 'farmacia',
      'HR': 'recursos',
      'Systems': 'sistemas',
      'Analytics': 'administrativo',
      'Communication': 'administrativo',
      'Storage': 'administrativo',
      'Productivity': 'administrativo'
    }
    return map[category] || 'administrativo'
  }

  // Métodos públicos
  addListener(callback) {
    console.log(`📝 Agregando listener (total: ${this.listeners.size + 1})`)
    this.listeners.add(callback)
    
    // Si ya tenemos datos, notificar inmediatamente
    if (this.applications.length > 0) {
      console.log(`📤 Enviando ${this.applications.length} aplicaciones al listener`)
      setTimeout(() => callback('data_loaded', this.applications), 0)
    }
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }

  notifyListeners(event, data = null) {
    console.log(`📢 Notificando "${event}" a ${this.listeners.size} listeners`)
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

  // Método para enviar solicitudes de soporte a Notion
  async submitSupportRequest(formData) {
    console.log('📝 Enviando solicitud de soporte a Notion...', formData)

    try {
      // Preparar datos para Notion - Estructura específica para reportes de soporte
      const notionData = {
        parent: { database_id: '2268c043-c537-810d-bdd3-eede4a941582' }, // ID específico para tabla de reportes
        properties: {
          'Titulo': {
            title: [
              {
                text: {
                  content: `${formData.requestType} - ${formData.userName}`
                }
              }
            ]
          },
          'Usuario': {
            rich_text: [
              {
                text: {
                  content: formData.userName
                }
              }
            ]
          },
          'Email': {
            email: formData.userEmail
          },
          'Tipo_de_Solicitud': {
            select: {
              name: formData.requestType
            }
          },
          'Descripcion': {
            rich_text: [
              {
                text: {
                  content: formData.messageDescription
                }
              }
            ]
          },
          'Estado': {
            select: {
              name: 'Pendiente'
            }
          },
          'Fecha_Creacion': {
            date: {
              start: new Date().toISOString().split('T')[0]
            }
          },
          'Prioridad': {
            select: {
              name: 'Media'
            }
          },
          'Timestamp': {
            rich_text: [
              {
                text: {
                  content: new Date().toISOString()
                }
              }
            ]
          }
        }
      }

      // Intentar enviar a través del proxy local primero
      try {
        const proxyResponse = await fetch('http://localhost:3001/api/support/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (proxyResponse.ok) {
          const result = await proxyResponse.json()
          console.log('✅ Solicitud de soporte enviada a través del proxy:', result)
          return { success: true, data: result }
        }
      } catch (proxyError) {
        console.log('⚠️ Proxy no disponible, intentando conexión directa...')
      }

      // Si el proxy no está disponible, intentar conexión directa
      const directResponse = await this.sendDirectSupportRequest(notionData)
      return directResponse

    } catch (error) {
      console.error('❌ Error al enviar solicitud de soporte:', error)
      throw new Error('No se pudo enviar la solicitud de soporte')
    }
  }

  async sendDirectSupportRequest(notionData) {
    const NOTION_TOKEN = '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'

    try {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify(notionData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Solicitud de soporte enviada directamente a Notion:', result)
      return { success: true, data: result }

    } catch (error) {
      console.error('❌ Error en conexión directa con Notion:', error)
      throw error
    }
  }

  destroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
    this.listeners.clear()
  }
}

// Crear instancia
const simpleNotionService = new SimpleNotionService()

export default simpleNotionService
