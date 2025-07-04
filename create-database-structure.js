// Script para crear la estructura de la base de datos de reportes de soporte
import https from 'https'

const NOTION_TOKEN = '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'
const PARENT_PAGE_ID = '21d8c043c5378041b9edc8285112adc9' // ID del workspace

function createSupportDatabase() {
  console.log('🛠️ Creando estructura de base de datos para reportes de soporte...')
  
  const data = JSON.stringify({
    parent: {
      type: "page_id",
      page_id: PARENT_PAGE_ID
    },
    title: [
      {
        type: "text",
        text: {
          content: "Reportes de Soporte HUV"
        }
      }
    ],
    properties: {
      "Titulo": {
        title: {}
      },
      "Usuario": {
        rich_text: {}
      },
      "Email": {
        email: {}
      },
      "Tipo_de_Solicitud": {
        select: {
          options: [
            { name: "sugerencia", color: "blue" },
            { name: "error", color: "red" },
            { name: "consulta", color: "green" },
            { name: "acceso", color: "yellow" },
            { name: "capacitacion", color: "purple" },
            { name: "tecnico", color: "orange" }
          ]
        }
      },
      "Descripcion": {
        rich_text: {}
      },
      "Estado": {
        select: {
          options: [
            { name: "Pendiente", color: "yellow" },
            { name: "En Proceso", color: "blue" },
            { name: "Resuelto", color: "green" },
            { name: "Cerrado", color: "gray" }
          ]
        }
      },
      "Fecha_Creacion": {
        date: {}
      },
      "Prioridad": {
        select: {
          options: [
            { name: "Baja", color: "green" },
            { name: "Media", color: "yellow" },
            { name: "Alta", color: "orange" },
            { name: "Crítica", color: "red" }
          ]
        }
      },
      "Timestamp": {
        rich_text: {}
      }
    }
  })

  const options = {
    hostname: 'api.notion.com',
    port: 443,
    path: '/v1/databases',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      'Content-Length': Buffer.byteLength(data)
    }
  }

  const req = https.request(options, (res) => {
    let responseData = ''

    res.on('data', (chunk) => {
      responseData += chunk
    })

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData)
        
        if (res.statusCode === 200) {
          console.log('✅ ¡Base de datos creada exitosamente!')
          console.log('📋 ID de la nueva base de datos:', result.id)
          console.log('🔗 URL:', result.url)
          console.log('')
          console.log('🎯 Propiedades configuradas:')
          console.log('   - Titulo (Title)')
          console.log('   - Usuario (Rich Text)')
          console.log('   - Email (Email)')
          console.log('   - Tipo_de_Solicitud (Select con opciones)')
          console.log('   - Descripcion (Rich Text)')
          console.log('   - Estado (Select con opciones)')
          console.log('   - Fecha_Creacion (Date)')
          console.log('   - Prioridad (Select con opciones)')
          console.log('   - Timestamp (Rich Text)')
          console.log('')
          console.log('📝 Ahora actualiza el código con este nuevo ID:')
          console.log(`   SUPPORT_DATABASE_ID = "${result.id}"`)
        } else {
          console.error('❌ Error creando la base de datos:', result)
          console.log('Status:', res.statusCode)
        }
      } catch (error) {
        console.error('❌ Error parseando respuesta:', error)
        console.log('Respuesta raw:', responseData)
      }
    })
  })

  req.on('error', (error) => {
    console.error('❌ Error en la petición:', error)
  })

  req.write(data)
  req.end()
}

// Ejecutar la creación
createSupportDatabase()
