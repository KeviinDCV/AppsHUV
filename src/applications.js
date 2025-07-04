// Datos de aplicaciones del Hospital Universitario del Valle
// Este archivo reemplaza la conexión con Notion

export const applications = [
  {
    id: 1,
    title: "Historia Clínica Electrónica",
    description: "Sistema integral para el manejo de historias clínicas digitales con acceso completo a información médica del paciente",
    category: "clinico",
    icon: "🏥",
    url: "https://hce.huv.gov.co",
    color: "bg-blue-500",
    order: 1,
    status: "active"
  },
  {
    id: 2,
    title: "Sistema de Facturación",
    description: "Gestión completa de facturación y cuentas médicas con integración a entidades de salud",
    category: "administrativo",
    icon: "💰",
    url: "https://facturacion.huv.gov.co",
    color: "bg-green-500",
    order: 2,
    status: "active"
  },
  {
    id: 3,
    title: "Laboratorio Clínico",
    description: "Sistema de gestión de laboratorio con resultados en línea y trazabilidad completa",
    category: "laboratorio",
    icon: "🔬",
    url: "https://laboratorio.huv.gov.co",
    color: "bg-red-500",
    order: 3,
    status: "active"
  },
  {
    id: 4,
    title: "Radiología e Imágenes",
    description: "Visualización y gestión de imágenes médicas con herramientas de diagnóstico avanzadas",
    category: "radiologia",
    icon: "📸",
    url: "https://radiologia.huv.gov.co",
    color: "bg-cyan-500",
    order: 4,
    status: "active"
  },
  {
    id: 5,
    title: "Farmacia Hospitalaria",
    description: "Control de inventario farmacéutico y dispensación de medicamentos",
    category: "farmacia",
    icon: "💊",
    url: "https://farmacia.huv.gov.co",
    color: "bg-purple-500",
    order: 5,
    status: "active"
  },
  {
    id: 6,
    title: "Gestión de Citas",
    description: "Sistema de agendamiento y gestión de citas médicas para pacientes",
    category: "administrativo",
    icon: "📅",
    url: "https://citas.huv.gov.co",
    color: "bg-orange-500",
    order: 6,
    status: "active"
  },
  {
    id: 7,
    title: "Urgencias",
    description: "Sistema de triage y gestión de pacientes en servicios de urgencias",
    category: "clinico",
    icon: "🚨",
    url: "https://urgencias.huv.gov.co",
    color: "bg-red-600",
    order: 7,
    status: "active"
  },
  {
    id: 8,
    title: "Recursos Humanos",
    description: "Gestión integral del talento humano y nómina del hospital",
    category: "administrativo",
    icon: "👥",
    url: "https://rrhh.huv.gov.co",
    color: "bg-indigo-500",
    order: 8,
    status: "active"
  },
  {
    id: 9,
    title: "Inventarios",
    description: "Control y gestión de inventarios médicos y administrativos",
    category: "administrativo",
    icon: "📦",
    url: "https://inventarios.huv.gov.co",
    color: "bg-yellow-500",
    order: 9,
    status: "active"
  },
  {
    id: 10,
    title: "Telemedicina",
    description: "Plataforma de consultas médicas virtuales y seguimiento remoto",
    category: "clinico",
    icon: "💻",
    url: "https://telemedicina.huv.gov.co",
    color: "bg-teal-500",
    order: 10,
    status: "active"
  },
  {
    id: 11,
    title: "Calidad y Seguridad",
    description: "Sistema de gestión de calidad y eventos adversos",
    category: "administrativo",
    icon: "🛡️",
    url: "https://calidad.huv.gov.co",
    color: "bg-pink-500",
    order: 11,
    status: "active"
  },
  {
    id: 12,
    title: "Capacitación Virtual",
    description: "Plataforma de educación continua y capacitación del personal",
    category: "recursos",
    icon: "🎓",
    url: "https://capacitacion.huv.gov.co",
    color: "bg-emerald-500",
    order: 12,
    status: "active"
  }
]

// Función para obtener todas las aplicaciones
export function getApplications() {
  return applications.filter(app => app.status === 'active')
}

// Función para obtener aplicaciones por categoría
export function getApplicationsByCategory(category) {
  if (category === 'all') {
    return getApplications()
  }
  return applications.filter(app => app.status === 'active' && app.category === category)
}

// Función para buscar aplicaciones
export function searchApplications(query) {
  if (!query) return getApplications()
  
  const searchTerm = query.toLowerCase()
  return applications.filter(app => 
    app.status === 'active' && (
      app.title.toLowerCase().includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm)
    )
  )
}

// Función para obtener una aplicación por ID
export function getApplicationById(id) {
  return applications.find(app => app.id === id && app.status === 'active')
}
