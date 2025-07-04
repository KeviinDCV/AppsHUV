// Script para probar la conexión con Notion y ver los datos reales
// Ejecutar con: node test-notion.js

const NOTION_TOKEN = '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'
const DATABASE_ID = '21d8c043c53781d080b8fa8e6a660bc8'

async function testNotionConnection() {
  console.log('🔗 Probando conexión con Notion...')
  console.log(`📊 Database ID: ${DATABASE_ID}`)
  
  try {
    // Primero, obtener información de la base de datos
    console.log('\n📋 Obteniendo información de la base de datos...')
    
    const dbResponse = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    })

    if (dbResponse.ok) {
      const dbData = await dbResponse.json()
      console.log('✅ Base de datos encontrada:', dbData.title?.[0]?.plain_text || 'Sin título')
      console.log('📝 Propiedades disponibles:')
      
      Object.keys(dbData.properties).forEach(prop => {
        const type = dbData.properties[prop].type
        console.log(`  - ${prop}: ${type}`)
      })
    } else {
      console.error('❌ Error al obtener info de la base de datos:', dbResponse.status)
    }

    // Luego, consultar las páginas
    console.log('\n📄 Consultando páginas...')
    
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 100
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`✅ Encontradas ${data.results.length} páginas`)

    if (data.results.length > 0) {
      console.log('\n📋 Aplicaciones encontradas:')
      
      data.results.forEach((page, index) => {
        const props = page.properties
        
        console.log(`\n${index + 1}. ID: ${page.id}`)
        
        // Mostrar todas las propiedades
        Object.keys(props).forEach(propName => {
          const prop = props[propName]
          let value = ''
          
          switch (prop.type) {
            case 'title':
              value = prop.title?.[0]?.plain_text || ''
              break
            case 'rich_text':
              value = prop.rich_text?.[0]?.plain_text || ''
              break
            case 'select':
              value = prop.select?.name || ''
              break
            case 'checkbox':
              value = prop.checkbox
              break
            case 'url':
              value = prop.url || ''
              break
            case 'number':
              value = prop.number || 0
              break
            case 'date':
              value = prop.date?.start || ''
              break
            default:
              value = JSON.stringify(prop)
          }
          
          if (value) {
            console.log(`   ${propName}: ${value}`)
          }
        })
      })
      
      // Generar código para las aplicaciones
      console.log('\n🔧 Código generado para las aplicaciones:')
      console.log('const applications = [')
      
      data.results.forEach((page, index) => {
        const props = page.properties
        
        const title = getPropertyValue(props.Name || props.Title) || `Aplicación ${index + 1}`
        const description = getPropertyValue(props.Description) || 'Descripción no disponible'
        const category = mapCategory(getPropertyValue(props.Category))
        const icon = getPropertyValue(props.Icon) || '📱'
        const url = getPropertyValue(props.URL) || '#'
        const color = getPropertyValue(props.Color) || 'bg-blue-500'
        const status = getPropertyValue(props.Status) || 'active'
        const published = getPropertyValue(props.Published) !== false
        
        console.log(`  {`)
        console.log(`    id: "${page.id}",`)
        console.log(`    title: "${title}",`)
        console.log(`    description: "${description}",`)
        console.log(`    category: "${category}",`)
        console.log(`    icon: "${icon}",`)
        console.log(`    url: "${url}",`)
        console.log(`    color: "${color}",`)
        console.log(`    order: ${index + 1},`)
        console.log(`    status: "${status}",`)
        console.log(`    published: ${published},`)
        console.log(`    lastUpdated: "${page.last_edited_time}"`)
        console.log(`  }${index < data.results.length - 1 ? ',' : ''}`)
      })
      
      console.log(']')
      
    } else {
      console.log('⚠️ No se encontraron páginas en la base de datos')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('CORS')) {
      console.log('\n💡 Solución: Este error es normal en el navegador debido a CORS.')
      console.log('   Para solucionarlo necesitas usar el backend proxy (server.js)')
    }
  }
}

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
      return property.checkbox
    case 'url':
      return property.url || ''
    case 'number':
      return property.number || 0
    default:
      return ''
  }
}

function mapCategory(category) {
  const map = {
    'Clinical': 'clinico',
    'Administrative': 'administrativo',
    'Laboratory': 'laboratorio',
    'Radiology': 'radiologia',
    'Pharmacy': 'farmacia',
    'HR': 'recursos',
    'Systems': 'sistemas',
    'Analytics': 'administrativo'
  }
  return map[category] || 'administrativo'
}

// Ejecutar el test
testNotionConnection()
