// Script para enviar un reporte de prueba y configurar automáticamente la tabla
async function testSupportForm() {
  console.log('🧪 Enviando reporte de prueba para configurar la tabla...')
  
  const testData = {
    userName: 'Sistema de Configuración',
    userEmail: 'sistema@huv.gov.co',
    requestType: 'tecnico',
    messageDescription: 'Este es un reporte de prueba para configurar automáticamente todas las columnas de la tabla de reportes de soporte. Puedes eliminar este registro una vez que confirmes que todo funciona correctamente.'
  }

  try {
    const response = await fetch('http://localhost:3001/api/support/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ ¡Tabla configurada exitosamente!')
      console.log('📋 ID del reporte de prueba:', result.id)
      console.log('🔗 Puedes ver la tabla en: https://www.notion.so/2268c043c5378052af1bc2cf53ef4564')
      console.log('')
      console.log('🎯 Columnas creadas automáticamente:')
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
      console.log('💡 Puedes eliminar el reporte de prueba desde Notion si quieres.')
    } else {
      const errorData = await response.json()
      console.error('❌ Error:', errorData)
    }
  } catch (error) {
    console.error('❌ Error enviando reporte de prueba:', error.message)
    console.log('')
    console.log('💡 Asegúrate de que el servidor esté ejecutándose:')
    console.log('   node server.js')
  }
}

// Ejecutar el test
testSupportForm()
