// Configuración del Centro de Aplicaciones
// Hospital Universitario del Valle "Evaristo García" E.S.E.

export const APP_CONFIG = {
  // Información del hospital
  hospital: {
    name: "Hospital Universitario del Valle",
    fullName: "Hospital Universitario del Valle \"Evaristo García\" E.S.E.",
    logo: "/logoacreditacion.png",
    website: "https://www.huv.gov.co",
    supportEmail: "soporte@huv.gov.co",
    supportPhone: "ext. 1234"
  },

  // Configuración de la aplicación
  app: {
    title: "Centro de Aplicaciones",
    description: "Accede a todas las herramientas y sistemas del Hospital Universitario del Valle",
    version: "1.0.0",
    author: "Hospital Universitario del Valle",
    keywords: ["hospital", "aplicaciones", "sistemas", "salud"]
  },

  // Configuración de animaciones
  animations: {
    duration: 0.8,
    staggerDelay: 0.1,
    scrollSmoothness: 2,
    scrollTouchSmoothness: 0.1,
    enableScrollSmoother: true,
    enableParallax: true
  },

  // Configuración de UI
  ui: {
    itemsPerPage: 12,
    enableSearch: true,
    enableFilters: true,
    enableThemeToggle: true,
    enableNotifications: true,
    autoSaveTheme: true,
    showLoadingScreen: true,
    loadingMinDuration: 2000
  },

  // Categorías de aplicaciones
  categories: {
    all: {
      name: "Todas",
      icon: "📱",
      color: "bg-gray-500"
    },
    clinico: {
      name: "Clínico",
      icon: "🏥",
      color: "bg-blue-500",
      description: "Sistemas para atención médica y clínica"
    },
    administrativo: {
      name: "Administrativo",
      icon: "📊",
      color: "bg-green-500",
      description: "Sistemas de gestión administrativa"
    },
    recursos: {
      name: "Recursos Humanos",
      icon: "👥",
      color: "bg-purple-500",
      description: "Gestión de personal y recursos humanos"
    },
    sistemas: {
      name: "Sistemas",
      icon: "🛠️",
      color: "bg-orange-500",
      description: "Herramientas de sistemas y soporte técnico"
    },
    farmacia: {
      name: "Farmacia",
      icon: "💊",
      color: "bg-pink-500",
      description: "Sistemas de farmacia hospitalaria"
    },
    laboratorio: {
      name: "Laboratorio",
      icon: "🔬",
      color: "bg-red-500",
      description: "Sistemas de laboratorio clínico"
    },
    radiologia: {
      name: "Radiología",
      icon: "📸",
      color: "bg-cyan-500",
      description: "Sistemas de imágenes médicas"
    }
  },



  // Configuración de seguridad
  security: {
    allowExternalLinks: true,
    openInNewTab: true,
    validateUrls: true,
    trustedDomains: [
      "huv.gov.co",
      "localhost",
      "127.0.0.1"
    ]
  },

  // Configuración de accesibilidad
  accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    enableHighContrast: false,
    enableReducedMotion: false,
    focusIndicators: true
  },

  // Configuración de performance
  performance: {
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableCodeSplitting: true,
    enableServiceWorker: false,
    enableAnalytics: false
  },

  // Mensajes del sistema
  messages: {
    loading: "Cargando Centro de Aplicaciones...",
    loadingApps: "Cargando aplicaciones...",
    noResults: "No se encontraron aplicaciones",
    searchPlaceholder: "Buscar aplicaciones...",
    error: "Ha ocurrido un error",
    networkError: "Error de conexión",
    dataError: "Error al cargar datos",
    success: "Operación exitosa",
    appOpening: "Abriendo aplicación...",
    urlNotConfigured: "URL no configurada para esta aplicación"
  },

  // Configuración de desarrollo
  development: {
    enableDebugMode: false,
    enableConsoleLogging: true,
    enablePerformanceMonitoring: false,
    mockDataDelay: 1000,
    showBuildInfo: false
  },

  // Enlaces rápidos del footer
  footerLinks: {
    primary: [
      { name: "Portal Principal", url: "https://www.huv.gov.co" },
      { name: "Soporte Técnico", url: "#soporte" },
      { name: "Documentación", url: "#docs" }
    ],
    secondary: [
      { name: "Políticas de Privacidad", url: "#privacy" },
      { name: "Términos de Uso", url: "#terms" },
      { name: "Contacto", url: "#contact" }
    ]
  },

  // Configuración de temas
  themes: {
    default: "system", // "light", "dark", "system"
    enableAutoSwitch: true,
    enableCustomThemes: false,
    customThemes: []
  },

  // Configuración de notificaciones
  notifications: {
    position: "top-right", // "top-left", "top-right", "bottom-left", "bottom-right"
    duration: 3000,
    enableSound: false,
    enableVibration: false,
    maxVisible: 5
  },

  // Configuración del formulario de soporte
  support: {
    notion: {
      databaseId: "2268c043-c537-810d-bdd3-eede4a941582", // ID específico para tabla de reportes de soporte
      tableName: "Reportes_de_Soporte_HUV", // Nombre de la tabla en Notion
      enabled: true
    },
    form: {
      requiredFields: ["userName", "userEmail", "requestType", "messageDescription"],
      minMessageLength: 20,
      maxMessageLength: 2000,
      allowedDepartments: [
        "administracion",
        "clinico",
        "enfermeria",
        "farmacia",
        "laboratorio",
        "radiologia",
        "sistemas",
        "recursos-humanos",
        "otro"
      ],
      allowedRequestTypes: [
        "sugerencia",
        "error",
        "consulta",
        "acceso",
        "capacitacion",
        "tecnico"
      ],
      allowedPriorityLevels: [
        "baja",
        "media",
        "alta",
        "critica"
      ]
    },
    messages: {
      sending: "Enviando tu solicitud...",
      success: "¡Solicitud enviada exitosamente! Te contactaremos pronto.",
      error: "Error al enviar la solicitud. Por favor, intenta nuevamente.",
      networkError: "Error de conexión. Verifica tu conexión a internet.",
      validationError: "Por favor, completa todos los campos requeridos.",
      messageTooShort: "La descripción debe tener al menos 20 caracteres.",
      messageTooLong: "La descripción no puede exceder 2000 caracteres.",
      invalidEmail: "Por favor, ingresa un correo electrónico válido."
    },
    autoResponse: {
      enabled: true,
      subject: "Confirmación de solicitud de soporte - Hospital Universitario del Valle",
      template: `
        Estimado/a {userName},

        Hemos recibido tu solicitud de soporte con los siguientes detalles:

        - Tipo de solicitud: {requestType}
        - Departamento: {userDepartment}
        - Prioridad: {priorityLevel}
        - Fecha: {timestamp}

        Nuestro equipo de soporte revisará tu solicitud y te contactaremos a la brevedad.

        Tiempo estimado de respuesta:
        - Crítica: 1-2 horas
        - Alta: 4-8 horas
        - Media: 1-2 días laborales
        - Baja: 3-5 días laborales

        Gracias por contactarnos.

        Equipo de Soporte Técnico
        Hospital Universitario del Valle "Evaristo García" E.S.E.
      `
    }
  }
}

// Configuración específica por entorno
export const ENV_CONFIG = {
  development: {
    apiUrl: "http://localhost:3000/api",
    enableDebug: true,
    enableMockData: true
  },
  production: {
    apiUrl: "https://api.huv.gov.co",
    enableDebug: false,
    enableMockData: false
  },
  staging: {
    apiUrl: "https://staging-api.huv.gov.co",
    enableDebug: true,
    enableMockData: false
  }
}

// Obtener configuración actual basada en el entorno
export function getCurrentConfig() {
  const env = import.meta.env.MODE || 'development'
  return {
    ...APP_CONFIG,
    ...ENV_CONFIG[env],
    env
  }
}

// Validar configuración
export function validateConfig(config = APP_CONFIG) {
  const required = [
    'hospital.name',
    'app.title',
    'categories'
  ]

  const missing = required.filter(path => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config)
    return value === undefined || value === null
  })

  if (missing.length > 0) {
    console.warn('Configuración incompleta. Faltan:', missing)
    return false
  }

  return true
}

// Obtener categoría por ID
export function getCategoryById(id) {
  return APP_CONFIG.categories[id] || APP_CONFIG.categories.all
}

// Obtener todas las categorías como array
export function getAllCategories() {
  return Object.entries(APP_CONFIG.categories).map(([id, category]) => ({
    id,
    ...category
  }))
}

// Verificar si una URL es confiable
export function isTrustedUrl(url) {
  if (!url || !APP_CONFIG.security.validateUrls) return true
  
  try {
    const urlObj = new URL(url)
    return APP_CONFIG.security.trustedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

// Exportar configuración por defecto
export default APP_CONFIG
