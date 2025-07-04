// Backend proxy para conexión en tiempo real con Notion
// Este servidor evita problemas de CORS y proporciona WebSocket para actualizaciones en tiempo real

import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { Client } from '@notionhq/client'
import http from 'http'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

// Configuración
const PORT = process.env.PORT || 3001
const NOTION_TOKEN = process.env.VITE_NOTION_TOKEN || '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'
const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID || '21d8c043c53781d080b8fa8e6a660bc8'
const SUPPORT_DATABASE_ID = process.env.VITE_NOTION_SUPPORT_DATABASE_ID || '2268c043-c537-810d-bdd3-eede4a941582'



// Cliente de Notion
const notion = new Client({
  auth: NOTION_TOKEN,
  notionVersion: '2022-06-28'
})

// Middleware
app.use(cors())
app.use(express.json())

// Cache para detectar cambios
let lastUpdateTime = null
let cachedApplications = []

// Función para mapear categorías de Notion a categorías locales
function mapNotionCategoryToLocal(notionCategory) {
  const categoryMap = {
    'Clinical': 'clinico',
    'Administrative': 'administrativo',
    'Laboratory': 'laboratorio',
    'Radiology': 'radiologia',
    'Pharmacy': 'farmacia',
    'HR': 'recursos',
    'Systems': 'sistemas',
    'Analytics': 'administrativo',
    'Project Management': 'administrativo',
    'Communication': 'administrativo',
    'Storage': 'administrativo',
    'Productivity': 'administrativo'
  }
  return categoryMap[notionCategory] || 'administrativo'
}

// Función para extraer valores de propiedades de Notion
function getPropertyValue(property) {
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

// Función para obtener aplicaciones desde Notion
async function fetchApplicationsFromNotion() {
  try {
    console.log('🔄 Consultando base de datos de Notion...')
    
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
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
      }
      // Eliminamos el sort por 'Order' ya que esa propiedad no existe en la base de datos
    })

    const applications = response.results.map((page, index) => ({
      id: page.id,
      title: getPropertyValue(page.properties.Name || page.properties.Title),
      description: getPropertyValue(page.properties.Description),
      category: mapNotionCategoryToLocal(getPropertyValue(page.properties.Category)),
      icon: getPropertyValue(page.properties.Icon) || '📱',
      url: getPropertyValue(page.properties.URL),
      color: getPropertyValue(page.properties.Color) || 'bg-blue-500',
      order: getPropertyValue(page.properties.Order) || index + 1,
      status: getPropertyValue(page.properties.Status),
      published: getPropertyValue(page.properties.Published),
      lastUpdated: page.last_edited_time,
      originalCategory: getPropertyValue(page.properties.Category)
    }))

    console.log(`✅ Obtenidas ${applications.length} aplicaciones de Notion`)
    return applications
    
  } catch (error) {
    console.error('❌ Error al consultar Notion:', error.message)
    throw error
  }
}

// Endpoint para obtener aplicaciones
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await fetchApplicationsFromNotion()
    
    // Actualizar cache
    cachedApplications = applications
    lastUpdateTime = new Date().toISOString()
    
    res.json({
      success: true,
      data: applications,
      lastUpdated: lastUpdateTime,
      count: applications.length
    })
    
  } catch (error) {
    console.error('Error en /api/applications:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    })
  }
})

// Endpoint para verificar cambios
app.get('/api/check-updates', async (req, res) => {
  try {
    const newApplications = await fetchApplicationsFromNotion()
    const currentTime = new Date().toISOString()
    
    // Comparar con cache para detectar cambios
    const hasChanges = JSON.stringify(newApplications) !== JSON.stringify(cachedApplications)
    
    if (hasChanges) {
      console.log('🔄 Cambios detectados en Notion')
      cachedApplications = newApplications
      lastUpdateTime = currentTime
      
      // Notificar a todos los clientes WebSocket
      broadcastUpdate(newApplications)
    }
    
    res.json({
      success: true,
      hasChanges,
      data: newApplications,
      lastUpdated: lastUpdateTime,
      count: newApplications.length
    })
    
  } catch (error) {
    console.error('Error en /api/check-updates:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      hasChanges: false
    })
  }
})

// Función para enviar actualizaciones a todos los clientes WebSocket
function broadcastUpdate(applications) {
  const message = JSON.stringify({
    type: 'applications_updated',
    data: applications,
    timestamp: new Date().toISOString()
  })
  
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message)
    }
  })
  
  console.log(`📡 Actualización enviada a ${wss.clients.size} clientes`)
}

// Configuración de WebSocket
wss.on('connection', (ws) => {
  console.log('🔌 Cliente WebSocket conectado')
  
  // Enviar datos actuales al cliente recién conectado
  if (cachedApplications.length > 0) {
    ws.send(JSON.stringify({
      type: 'initial_data',
      data: cachedApplications,
      timestamp: lastUpdateTime
    }))
  }
  
  ws.on('close', () => {
    console.log('🔌 Cliente WebSocket desconectado')
  })
  
  ws.on('error', (error) => {
    console.error('❌ Error en WebSocket:', error)
  })
})



// Función para agregar solicitud de soporte
async function addSupportRequest(requestData) {
  try {
    // Usar la base de datos específica para reportes de soporte
    const response = await notion.pages.create({
      parent: {
        database_id: SUPPORT_DATABASE_ID
      },
      properties: {
        'Titulo': {
          title: [
            {
              text: {
                content: `${requestData.requestType} - ${requestData.userName}`
              }
            }
          ]
        },
        'Usuario': {
          rich_text: [
            {
              text: {
                content: requestData.userName
              }
            }
          ]
        },
        'Email': {
          email: requestData.userEmail
        },
        'Tipo_de_Solicitud': {
          select: {
            name: requestData.requestType
          }
        },
        'Descripcion': {
          rich_text: [
            {
              text: {
                content: requestData.messageDescription
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
    })

    console.log('✅ Solicitud de soporte agregada a Notion:', response.id)
    return response
  } catch (error) {
    console.error('❌ Error agregando solicitud de soporte:', error)
    throw error
  }
}

// Endpoints para soporte
app.get('/api/support/health', (req, res) => {
  console.log('🔍 Health check solicitado')
  res.json({
    status: 'ok',
    message: 'Servicio de soporte disponible',
    timestamp: new Date().toISOString()
  })
})

app.post('/api/support/submit', async (req, res) => {
  try {
    const requestData = req.body
    console.log('📥 Solicitud recibida:', requestData)

    // Validar datos requeridos
    if (!requestData.userName || !requestData.userEmail || !requestData.requestType || !requestData.messageDescription) {
      console.log('❌ Faltan campos requeridos')
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      })
    }

    console.log('✅ Datos validados, creando solicitud en Notion...')

    // Agregar a Notion usando la función real
    const notionResponse = await addSupportRequest(requestData)

    console.log('✅ Solicitud enviada exitosamente')
    res.json({
      success: true,
      message: 'Solicitud enviada exitosamente',
      id: notionResponse.id,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error en /api/support/submit:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
})



// Polling para verificar cambios cada 5 segundos
setInterval(async () => {
  try {
    await fetchApplicationsFromNotion()
  } catch (error) {
    console.error('Error en polling:', error.message)
  }
}, 5000)

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`)
  console.log(`📡 WebSocket disponible en ws://localhost:${PORT}`)
  console.log(`🔄 Polling cada 5 segundos para detectar cambios`)
  console.log(`🎧 Endpoints de soporte disponibles en /api/support/*`)
})

export default app
