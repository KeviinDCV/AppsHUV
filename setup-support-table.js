// Script para configurar automáticamente la tabla de reportes de soporte en Notion
import https from 'https'

const NOTION_TOKEN = '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'
const SUPPORT_DATABASE_ID = '2268c043c5378052af1bc2cf53ef4564'

function setupSupportTable() {
  console.log('🛠️ Configurando tabla de reportes de soporte...')

  const data = JSON.stringify({
    parent: {
      database_id: SUPPORT_DATABASE_ID
    },
    properties: {
      'Titulo': {
        title: [
          {
            text: {
              content: 'Prueba - Configuración de Tabla'
            }
          }
        ]
      },
      'Usuario': {
        rich_text: [
          {
            text: {
              content: 'Sistema de Configuración'
            }
          }
        ]
      },
      'Email': {
        email: 'sistema@huv.gov.co'
      },
      'Tipo_de_Solicitud': {
        select: {
          name: 'tecnico'
        }
      },
      'Descripcion': {
        rich_text: [
          {
            text: {
              content: 'Este es un reporte de prueba para configurar automáticamente todas las columnas de la tabla de reportes de soporte. Puedes eliminar este registro una vez que confirmes que todo funciona correctamente.'
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

  const options = {
    hostname: 'api.notion.com',
    port: 443,
    path: '/v1/pages',
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
          console.log('✅ Tabla configurada exitosamente!')
          console.log('📋 ID del reporte de prueba:', result.id)
          console.log('🔗 Puedes ver la tabla en: https://www.notion.so/' + SUPPORT_DATABASE_ID)
          console.log('')
          console.log('🎯 Columnas creadas:')
          console.log('   - Titulo (Title)')
          console.log('   - Usuario (Text)')
          console.log('   - Email (Email)')
          console.log('   - Tipo_de_Solicitud (Select)')
          console.log('   - Descripcion (Text)')
          console.log('   - Estado (Select)')
          console.log('   - Fecha_Creacion (Date)')
          console.log('   - Prioridad (Select)')
          console.log('   - Timestamp (Text)')
          console.log('')
          console.log('🚀 ¡La tabla está lista para recibir reportes reales!')
          console.log('💡 Puedes eliminar el reporte de prueba si quieres.')
        } else {
          console.error('❌ Error configurando la tabla:', result)
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

// Ejecutar la configuración
setupSupportTable()
