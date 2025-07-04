// Servidor proxy simple para evitar CORS con Notion
// Solo usa módulos nativos de Node.js

const http = require('http')
const https = require('https')
const url = require('url')

const PORT = 3001
const NOTION_TOKEN = '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'
const DATABASE_ID = '21d8c043c53781d080b8fa8e6a660bc8'

// Función para hacer peticiones HTTPS
function makeHttpsRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ status: res.statusCode, data: jsonData })
        } catch (error) {
          reject(new Error('Error parsing JSON: ' + error.message))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    if (postData) {
      req.write(postData)
    }
    
    req.end()
  })
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

// Mapear categorías de Notion a categorías locales
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
    'Project Management': 'administrativo'
  }
  return categoryMap[notionCategory] || 'administrativo'
}

// Obtener aplicaciones desde Notion
async function fetchApplicationsFromNotion() {
  console.log('🔄 Consultando base de datos de Notion...')
  
  const options = {
    hostname: 'api.notion.com',
    port: 443,
    path: `/v1/databases/${DATABASE_ID}/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    }
  }
  
  const postData = JSON.stringify({
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
  
  try {
    const response = await makeHttpsRequest(options, postData)
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const applications = response.data.results.map((page, index) => ({
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
    })).filter(app => app.title) // Filtrar aplicaciones sin título
    
    console.log(`✅ Obtenidas ${applications.length} aplicaciones de Notion`)
    return applications
    
  } catch (error) {
    console.error('❌ Error al consultar Notion:', error.message)
    throw error
  }
}

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  console.log(`📥 ${req.method} ${req.url}`)
  
  if (parsedUrl.pathname === '/api/applications' && req.method === 'GET') {
    try {
      const applications = await fetchApplicationsFromNotion()
      
      const response = {
        success: true,
        data: applications,
        lastUpdated: new Date().toISOString(),
        count: applications.length
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(response))
      
    } catch (error) {
      console.error('Error en /api/applications:', error)
      
      const errorResponse = {
        success: false,
        error: error.message,
        data: []
      }
      
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(errorResponse))
    }
  } else {
    // 404 para otras rutas
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor proxy ejecutándose en puerto ${PORT}`)
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/applications`)
  console.log(`🔗 Conectando con Notion Database: ${DATABASE_ID}`)
})

// Manejar errores del servidor
server.on('error', (error) => {
  console.error('❌ Error del servidor:', error.message)
})
