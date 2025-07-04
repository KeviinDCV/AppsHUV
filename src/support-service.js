// Servicio para manejar solicitudes de soporte con Notion
class SupportService {
  constructor() {
    this.baseUrl = 'http://localhost:3001'
    this.databaseId = null // Se configurará dinámicamente
    this.isConnected = false
    this.listeners = []
  }

  // Inicializar el servicio
  async initialize() {
    console.log('🎧 Inicializando servicio de soporte...')
    
    try {
      // Verificar conexión con el backend
      const response = await fetch(`${this.baseUrl}/api/support/health`)
      if (response.ok) {
        this.isConnected = true
        console.log('✅ Servicio de soporte conectado')
      }
    } catch (error) {
      console.error('❌ Error conectando servicio de soporte:', error)
      this.isConnected = false
    }
  }

  // Enviar solicitud de soporte
  async submitSupportRequest(formData) {
    console.log('📤 Enviando solicitud de soporte:', formData)

    if (!this.isConnected) {
      throw new Error('Servicio de soporte no disponible')
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/support/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: formData.userName,
          userEmail: formData.userEmail,
          requestType: formData.requestType,
          messageDescription: formData.messageDescription,
          timestamp: new Date().toISOString(),
          status: 'Pendiente'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al enviar solicitud')
      }

      const result = await response.json()
      console.log('✅ Solicitud enviada exitosamente:', result)
      
      // Notificar a los listeners
      this.notifyListeners('request_submitted', result)
      
      return result
    } catch (error) {
      console.error('❌ Error enviando solicitud:', error)
      throw error
    }
  }

  // Obtener solicitudes de soporte (para administración)
  async getSupportRequests() {
    if (!this.isConnected) {
      throw new Error('Servicio de soporte no disponible')
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/support/requests`)
      
      if (!response.ok) {
        throw new Error('Error obteniendo solicitudes')
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes:', error)
      throw error
    }
  }

  // Validar datos del formulario
  validateFormData(formData) {
    const errors = []

    // Validar nombre
    if (!formData.userName || formData.userName.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres')
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.userEmail || !emailRegex.test(formData.userEmail)) {
      errors.push('Ingresa un correo electrónico válido')
    }

    // Validar tipo de solicitud
    if (!formData.requestType || formData.requestType.trim().length < 3) {
      errors.push('El tipo de solicitud debe tener al menos 3 caracteres')
    }

    // Validar descripción
    if (!formData.messageDescription || formData.messageDescription.trim().length < 20) {
      errors.push('La descripción debe tener al menos 20 caracteres')
    }

    return errors
  }

  // Agregar listener para eventos
  addListener(callback) {
    this.listeners.push(callback)
    console.log(`📝 Listener agregado (total: ${this.listeners.length})`)
  }

  // Remover listener
  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
      console.log(`📝 Listener removido (total: ${this.listeners.length})`)
    }
  }

  // Notificar a todos los listeners
  notifyListeners(event, data) {
    console.log(`📢 Notificando "${event}" a ${this.listeners.length} listeners`)
    this.listeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('❌ Error en listener:', error)
      }
    })
  }

  // Limpiar recursos
  cleanup() {
    this.listeners = []
    this.isConnected = false
    console.log('🧹 Servicio de soporte limpiado')
  }
}

// Crear instancia global
const supportService = new SupportService()

// Inicializar cuando se carga el módulo
supportService.initialize()

export default supportService
