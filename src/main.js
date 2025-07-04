import './index.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import notionService from './notion-simple.js'
import supportService from './support-service.js'
import { toast, Modal, LoadingSpinner, AnimationUtils } from './components.js'
import { getCurrentConfig, getCategoryById, isTrustedUrl } from './config.js'

// Registrar plugins de GSAP
gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

// Obtener configuración
const CONFIG = getCurrentConfig()

// Estado de la aplicación
const state = {
  applications: [],
  filteredApplications: [],
  currentFilter: 'all',
  isLoading: true,
  isDarkMode: false,
  isConnected: false,
  lastUpdateTime: null,
  cardsAnimated: false // Bandera para evitar animaciones duplicadas
}

// Inicialización de la aplicación
class AppCenter {
  constructor() {
    this.init()
  }

  async init() {
    // Prevenir scroll durante loading
    document.body.classList.add('loading-active')



    // Configurar tema primero para evitar parpadeos
    this.setupTheme()

    // Configurar ScrollSmoother
    this.setupScrollSmoother()

    // Configurar eventos
    this.setupEventListeners()

    // Configurar servicio de Notion
    this.setupNotionService()

    // Animaciones de carga
    await this.playLoadingAnimation()

    // Cargar aplicaciones desde Notion
    await this.loadApplications()

    // Restaurar scroll
    document.body.classList.remove('loading-active')

    // Pequeño delay antes de las animaciones de entrada
    setTimeout(() => {
      // Animaciones de entrada
      this.playEntranceAnimations()
    }, 100)

    // Configurar animaciones de scroll
    this.setupScrollAnimations()
  }

  // Configurar servicio de Notion para tiempo real
  setupNotionService() {
    console.log('🔌 Configurando servicio de Notion...')

    // Agregar listener para eventos del servicio
    notionService.addListener((event, data) => {
      switch (event) {
        case 'data_loaded':
          console.log('📥 Datos iniciales cargados desde Notion')
          this.handleApplicationsLoaded(data)
          break

        case 'data_updated':
          console.log('🔄 Datos actualizados en tiempo real')
          this.handleApplicationsUpdated(data)
          break

        case 'connected':
          console.log('✅ Conectado a Notion en tiempo real')
          state.isConnected = true
          break

        case 'disconnected':
          console.log('🔌 Desconectado de Notion')
          state.isConnected = false
          break

        case 'error':
          console.error('❌ Error en servicio de Notion:', data)
          this.showErrorMessage('Error de conexión con Notion')
          break
      }
    })
  }

  setupScrollSmoother() {
    // Configurar ScrollSmoother para experiencia premium
    if (CONFIG.animations.enableScrollSmoother) {
      this.smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: CONFIG.animations.scrollSmoothness,
        effects: CONFIG.animations.enableParallax,
        smoothTouch: CONFIG.animations.scrollTouchSmoothness,
        normalizeScroll: true
      })
    }
  }

  setupTheme() {
    // Detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const savedTheme = localStorage.getItem('theme')
    
    state.isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark
    this.applyTheme()
  }

  applyTheme() {
    const html = document.documentElement
    if (state.isDarkMode) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light')
  }

  setupEventListeners() {
    // Navegación entre pantallas
    const exploreAppsBtn = document.getElementById('explore-apps-btn')
    const backToWelcomeBtn = document.getElementById('back-to-welcome-btn')
    const backToWelcomeFromSupportBtn = document.getElementById('back-to-welcome-from-support-btn')

    if (exploreAppsBtn) {
      exploreAppsBtn.addEventListener('click', () => {
        this.showApplicationsSection()
      })
    }

    if (backToWelcomeBtn) {
      backToWelcomeBtn.addEventListener('click', () => {
        this.showWelcomeScreen()
      })
    }

    if (backToWelcomeFromSupportBtn) {
      backToWelcomeFromSupportBtn.addEventListener('click', () => {
        this.showWelcomeScreen()
      })
    }

    // Toggle de tema
    const themeToggle = document.getElementById('theme-toggle')
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        state.isDarkMode = !state.isDarkMode
        this.applyTheme()
        this.animateThemeTransition()
      })
    }

    // Búsqueda
    const searchInput = document.getElementById('search-input')
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value)
      })
    }

    // Los filtros se configurarán dinámicamente cuando se carguen las aplicaciones

    // Navegación suave y manejo de enlaces especiales
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault()
        const href = anchor.getAttribute('href')

        // Manejar navegación especial
        if (href === '#soporte') {
          this.showSupportSection()
        } else if (href === '#inicio') {
          this.showWelcomeScreen()
        } else {
          const target = document.querySelector(href)
          if (target) {
            this.smoother.scrollTo(target, true, "top 100px")
          }
        }
      })
    })

    // Configurar formulario de soporte
    this.setupSupportForm()
  }

  async playLoadingAnimation() {
    console.log('🔄 Iniciando animación de loading')

    // Debug del logo de loading
    const loadingLogo = document.getElementById('loading-logo')
    if (loadingLogo) {
      console.log('📷 Loading logo encontrado:', {
        src: loadingLogo.src,
        complete: loadingLogo.complete,
        naturalWidth: loadingLogo.naturalWidth,
        naturalHeight: loadingLogo.naturalHeight
      })

      // Forzar visibilidad inmediata
      loadingLogo.style.opacity = '1'
      loadingLogo.style.display = 'block'
      loadingLogo.style.visibility = 'visible'
    } else {
      console.error('❌ Loading logo NO encontrado')
    }

    const tl = gsap.timeline()

    // Animar logo de carga (ya está posicionado correctamente por CSS)
    tl.to('#loading-logo', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    })
    .to('#loading-text', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")

    // Tiempo de carga
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Ocultar pantalla de carga con efecto suave
    tl.to('#loading-screen', {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        const loadingScreen = document.getElementById('loading-screen')
        if (loadingScreen) {
          loadingScreen.style.display = 'none'
        }
        // Asegurar que el scroll se restaure
        document.body.classList.remove('loading-active')
        console.log('🎬 Loading screen ocultado, preparando animaciones de entrada')
      }
    })

    return tl
  }

  async loadApplications() {
    try {
      console.log('🔄 Cargando aplicaciones desde Notion...')

      // Si ya tenemos aplicaciones, no mostrar loading
      if (state.applications.length > 0) {
        console.log('✅ Aplicaciones ya disponibles')
        return
      }

      // Mostrar indicador de carga solo si no hay aplicaciones
      const appsLoading = document.getElementById('apps-loading')
      if (appsLoading) {
        appsLoading.style.display = 'block'
      }

      // Las aplicaciones se cargarán automáticamente a través del servicio de Notion
      // El servicio notificará cuando estén listas
      console.log('⏳ Esperando datos desde Notion...')

    } catch (error) {
      console.error('Error al cargar aplicaciones:', error)
      state.isLoading = false
      this.showErrorMessage('Error al cargar las aplicaciones. Por favor, intenta de nuevo.')
      toast.show('Error al cargar aplicaciones', 'error', 5000)
    }
  }

  // Manejar aplicaciones cargadas inicialmente
  handleApplicationsLoaded(applications) {
    console.log(`📥 Aplicaciones cargadas: ${applications.length}`)

    state.applications = applications
    state.filteredApplications = this.applyCurrentFilter(applications)
    state.isLoading = false

    // Ocultar loading
    const appsLoading = document.getElementById('apps-loading')
    if (appsLoading) {
      appsLoading.style.display = 'none'
    }

    // Generar filtros dinámicos basándose en las categorías disponibles
    this.generateDynamicFilters(applications)

    this.renderApplications()
    // NO animar aquí - se hará en renderApplications()
  }

  // Manejar actualizaciones en tiempo real
  handleApplicationsUpdated(applications) {
    console.log(`🔄 Aplicaciones actualizadas: ${applications.length}`)

    const previousCount = state.applications.length

    state.applications = applications
    state.filteredApplications = this.applyCurrentFilter(applications)
    state.lastUpdateTime = new Date().toISOString()

    // Regenerar filtros dinámicos en caso de que hayan cambiado las categorías
    this.generateDynamicFilters(applications)

    this.renderApplications()

    // Mostrar notificación de actualización
    this.showUpdateNotification(applications.length, previousCount)

    // Animar las cards actualizadas
    setTimeout(() => {
      this.animateApplicationCards()
    }, 100)
  }

  // Aplicar filtro actual a las aplicaciones
  applyCurrentFilter(applications) {
    if (state.currentFilter === 'all') {
      return applications
    }
    return applications.filter(app => app.category === state.currentFilter)
  }

  // Generar filtros dinámicos basándose en las categorías disponibles
  generateDynamicFilters(applications) {
    console.log('🔧 Generando filtros dinámicos para', applications.length, 'aplicaciones')
    const filtersContainer = document.getElementById('filters')
    if (!filtersContainer) {
      console.error('❌ No se encontró el contenedor de filtros')
      return
    }

    // Obtener categorías únicas de las aplicaciones
    const availableCategories = [...new Set(applications.map(app => app.category))]
    console.log('📂 Categorías disponibles:', availableCategories)

    // Determinar qué filtro debe estar activo (preservar estado actual o usar 'all' por defecto)
    const currentFilter = state.currentFilter || 'all'
    console.log('🎯 Filtro actual:', currentFilter)

    // Siempre incluir "Todas" como primera opción
    const isAllActive = currentFilter === 'all'
    const filterButtons = [`
      <button class="px-4 py-2 ${isAllActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent'} rounded-lg font-medium filter-btn ${isAllActive ? 'active' : ''} transition-colors" data-filter="all">
        Todas
      </button>
    `]

    // Agregar botones para cada categoría disponible
    availableCategories.forEach(category => {
      const categoryConfig = this.getCategoryConfig(category)
      const isActive = currentFilter === category
      filterButtons.push(`
        <button class="px-4 py-2 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent'} rounded-lg font-medium filter-btn ${isActive ? 'active' : ''} transition-colors" data-filter="${category}">
          ${categoryConfig.name}
        </button>
      `)
    })

    filtersContainer.innerHTML = filterButtons.join('')
    console.log('✅ Filtros generados:', filterButtons.length, '- Filtro activo:', currentFilter)

    // Reattach event listeners para los nuevos botones
    this.attachFilterListeners()
  }

  // Obtener configuración de categoría (ahora maneja categorías originales de Notion)
  getCategoryConfig(category) {
    const categoryMap = {
      // Categorías originales de Notion
      'Clinical': { name: 'Clínico' },
      'Administrative': { name: 'Administrativo' },
      'Laboratory': { name: 'Laboratorio' },
      'Radiology': { name: 'Radiología' },
      'Pharmacy': { name: 'Farmacia' },
      'HR': { name: 'Recursos Humanos' },
      'Systems': { name: 'Sistemas' },
      'Analytics': { name: 'Analytics' },
      'Communication': { name: 'Comunicación' },
      'Storage': { name: 'Almacenamiento' },
      'Productivity': { name: 'Productividad' },
      'Business': { name: 'Negocios' },
      'Project Management': { name: 'Gestión de Proyectos' },
      // Mantener compatibilidad con categorías mapeadas por si acaso
      'clinico': { name: 'Clínico' },
      'administrativo': { name: 'Administrativo' },
      'recursos': { name: 'Recursos Humanos' },
      'sistemas': { name: 'Sistemas' },
      'laboratorio': { name: 'Laboratorio' },
      'radiologia': { name: 'Radiología' },
      'farmacia': { name: 'Farmacia' }
    }
    return categoryMap[category] || { name: category.charAt(0).toUpperCase() + category.slice(1) }
  }

  // Reattach event listeners para filtros
  attachFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn')
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleFilter(e.target.dataset.filter)
      })
    })
  }

  // Mostrar notificación de actualización
  showUpdateNotification(newCount, previousCount) {
    const message = newCount !== previousCount
      ? `Aplicaciones actualizadas: ${previousCount} → ${newCount}`
      : `${newCount} aplicaciones sincronizadas`

    toast.show(message, 'success', 3000)

    // Crear notificación visual adicional
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300'
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span class="text-sm font-medium">${message}</span>
      </div>
    `

    document.body.appendChild(notification)

    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full')
    }, 100)

    // Animar salida y remover
    setTimeout(() => {
      notification.classList.add('translate-x-full')
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 4000)
  }









  renderApplications() {
    const grid = document.getElementById('applications-grid')
    const loading = document.getElementById('apps-loading')

    // Ocultar loading inmediatamente (ya no lo necesitamos)
    if (loading) {
      loading.style.display = 'none'
    }

    // Limpiar grid
    grid.innerHTML = ''

    // Verificar si hay aplicaciones para renderizar
    if (state.filteredApplications.length === 0) {
      console.log('⚠️ No hay aplicaciones para renderizar')
      grid.innerHTML = '<div class="col-span-full text-center py-16"><p class="text-muted-foreground">No se encontraron aplicaciones</p></div>'
      return
    }

    console.log(`📋 Renderizando ${state.filteredApplications.length} aplicaciones`)

    // Renderizar aplicaciones
    state.filteredApplications.forEach((app, index) => {
      const card = this.createApplicationCard(app, index)
      grid.appendChild(card)
    })

    // NO animar aquí - las animaciones se manejan desde otros lugares
    // para evitar duplicaciones
  }

  createApplicationCard(app, index) {
    const card = document.createElement('div')
    card.className = 'app-card group'
    card.dataset.category = app.category
    card.setAttribute('role', 'button')
    card.setAttribute('tabindex', '0')
    card.setAttribute('aria-label', `Abrir aplicación ${app.title}: ${app.description}`)
    card.innerHTML = `
      <div class="app-card-content">
        <div class="app-card-icon ${app.color}">
          ${app.icon}
        </div>
        <h4 class="app-card-title">${app.title}</h4>
        <p class="app-card-description">${app.description}</p>
        <div class="flex items-center justify-between">
          <span class="app-card-category">
            ${this.getCategoryName(app.category)}
          </span>
          <svg class="w-4 h-4 text-muted-foreground/50 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    `
    
    // Agregar eventos de interacción
    card.addEventListener('click', (event) => {
      this.handleApplicationClick(app, event.currentTarget)
    })

    // Soporte para navegación por teclado
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        this.handleApplicationClick(app, event.currentTarget)
      }
    })
    
    return card
  }

  getCategoryName(category) {
    const categoryConfig = this.getCategoryConfig(category)
    return categoryConfig.name || category
  }

  animateApplicationCards() {
    const cards = document.querySelectorAll('.app-card')

    // Verificar que existan elementos antes de animar
    if (cards.length === 0) {
      console.log('⚠️ No se encontraron tarjetas de aplicaciones para animar')
      return
    }

    // Evitar animaciones duplicadas
    if (state.cardsAnimated) {
      console.log('⚠️ Las tarjetas ya fueron animadas, saltando animación')
      return
    }

    console.log(`🎬 Animando ${cards.length} tarjetas de aplicaciones`)
    state.cardsAnimated = true

    // Animación de entrada sutil y profesional con GSAP
    gsap.fromTo(cards,
      {
        opacity: 0,
        y: 20,
        scale: 0.98
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.0,
        ease: "power2.out",
        stagger: {
          amount: 0.4,
          from: "start"
        },
        onComplete: () => {
          // No agregar efectos de hover - mantener cards estáticas y profesionales
        }
      }
    )
  }



  playEntranceAnimations() {
    console.log('🎬 Iniciando animaciones de entrada - Solo pantalla de bienvenida')

    // El header ya está oculto con la clase 'hidden' en el HTML
    // Ocultar sección de aplicaciones inicialmente
    const applicationsSection = document.getElementById('applications-section')
    if (applicationsSection) {
      applicationsSection.classList.add('hidden')
    }

    // Solo animar la pantalla de bienvenida
    this.animateWelcomeElements()

    // Asegurar transparencia de logos una sola vez
    this.ensureLogosTransparency()
  }

  ensureLogosTransparency() {
    console.log('🔧 Asegurando transparencia solo para logoacreditacion.png')

    // Solo aplicar transparencia a logoacreditacion.png (loading screen y welcome screen)
    const loadingLogos = document.querySelectorAll('img[src*="logoacreditacion"]')

    loadingLogos.forEach((logo, index) => {
      // Forzar mix-blend-mode y transparencia solo para logoacreditacion.png
      logo.style.mixBlendMode = 'multiply'
      logo.style.background = 'transparent'
      logo.style.backgroundColor = 'transparent'

      // En modo oscuro, usar screen blend mode
      if (document.documentElement.classList.contains('dark')) {
        logo.style.mixBlendMode = 'screen'
      }

      console.log(`🔧 Logo logoacreditacion ${index + 1} transparencia aplicada`)
    })

    // Para logo.png (solo header ahora), asegurar que se vea normalmente
    const normalLogos = document.querySelectorAll('img[src*="logo.png"]')
    normalLogos.forEach((logo, index) => {
      // Remover cualquier mix-blend-mode que pueda interferir
      logo.style.mixBlendMode = 'normal'
      logo.style.background = 'transparent'
      console.log(`🔧 Logo normal ${index + 1} configurado`)
    })
  }

  showApplicationsSection() {
    console.log('🔄 Mostrando sección de aplicaciones')

    const welcomeScreen = document.getElementById('welcome-screen')
    const applicationsSection = document.getElementById('applications-section')
    const header = document.getElementById('main-header')

    // Animar salida de la pantalla de bienvenida
    gsap.to(welcomeScreen, {
      opacity: 0,
      y: -50,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        welcomeScreen.style.display = 'none'

        // Mostrar header y sección de aplicaciones
        if (header) {
          header.classList.remove('hidden')
        }
        applicationsSection.classList.remove('hidden')

        // Animar entrada de la sección de aplicaciones
        gsap.fromTo(applicationsSection,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
              // Animar elementos de la sección de aplicaciones
              this.animateApplicationsElements()
            }
          }
        )
      }
    })
  }

  showWelcomeScreen() {
    console.log('🔄 Mostrando pantalla de bienvenida')

    const welcomeScreen = document.getElementById('welcome-screen')
    const applicationsSection = document.getElementById('applications-section')
    const supportSection = document.getElementById('support-section')
    const header = document.getElementById('main-header')

    // Animar salida de las secciones activas
    const activeSections = [applicationsSection, supportSection].filter(section =>
      section && !section.classList.contains('hidden')
    )

    if (activeSections.length > 0) {
      gsap.to(activeSections, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          // Ocultar todas las secciones
          applicationsSection.classList.add('hidden')
          supportSection.classList.add('hidden')

          // Ocultar header
          if (header) {
            header.classList.add('hidden')
          }

          // Mostrar pantalla de bienvenida
          welcomeScreen.style.display = 'flex'

          // Animar entrada de la pantalla de bienvenida
          gsap.fromTo(welcomeScreen,
            { opacity: 0, y: -50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              onComplete: () => {
                // Re-animar elementos de bienvenida
                this.animateWelcomeElements()
              }
            }
          )
        }
      })
    } else {
      // Si no hay secciones activas, mostrar directamente
      applicationsSection.classList.add('hidden')
      supportSection.classList.add('hidden')
      if (header) {
        header.classList.add('hidden')
      }
      welcomeScreen.style.display = 'flex'
      this.animateWelcomeElements()
    }
  }

  showSupportSection() {
    console.log('🎧 Mostrando sección de soporte')

    const welcomeScreen = document.getElementById('welcome-screen')
    const applicationsSection = document.getElementById('applications-section')
    const supportSection = document.getElementById('support-section')
    const header = document.getElementById('main-header')

    // Ocultar otras secciones
    welcomeScreen.style.display = 'none'
    applicationsSection.classList.add('hidden')

    // Mostrar sección de soporte y header
    supportSection.classList.remove('hidden')
    header.classList.remove('hidden')

    // Animar elementos del header
    this.animateHeaderElements()

    // Animar entrada de la sección de soporte con animación profesional
    this.animateSupportSectionEntrance(supportSection)

    // No configurar interacciones adicionales - mantener solo efectos CSS básicos

    // Scroll al inicio de la sección
    if (this.smoother) {
      this.smoother.scrollTo('#support-section', true, "top 0px")
    } else {
      window.scrollTo(0, 0)
    }
  }

  animateHeaderElements() {
    console.log('🎬 Animando elementos del header')

    const headerLogo = document.getElementById('header-logo')
    const headerText = document.getElementById('header-text')
    const headerNav = document.getElementById('header-nav')
    const headerControls = document.getElementById('header-controls')

    // Timeline principal para animaciones coordinadas
    const tl = gsap.timeline()

    // Animar logo del header
    if (headerLogo) {
      tl.fromTo(headerLogo,
        { opacity: 0, x: -30, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        }
      )
    }

    // Animar texto del header
    if (headerText) {
      tl.fromTo(headerText,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.6"
      )
    }

    // Animar navegación
    if (headerNav) {
      tl.fromTo(headerNav,
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.4"
      )
    }

    // Animar controles
    if (headerControls) {
      tl.fromTo(headerControls,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.4"
      )
    }

    return tl
  }

  animateSupportSectionEntrance(supportSection) {
    console.log('🎬 Animando entrada de sección de soporte')

    // Timeline principal para la sección de soporte
    const tl = gsap.timeline()

    // Animar contenedor principal
    tl.fromTo(supportSection,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }
    )

    // Animar elementos internos con stagger
    const supportTitle = supportSection.querySelector('h2')
    const supportSubtitle = supportSection.querySelector('p')
    const supportForm = supportSection.querySelector('#support-form')
    const contactCards = supportSection.querySelectorAll('.bg-card')
    const backButton = supportSection.querySelector('#back-to-welcome-from-support-btn')

    // Animar botón de regreso
    if (backButton) {
      tl.fromTo(backButton,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.6"
      )
    }

    // Animar título
    if (supportTitle) {
      tl.fromTo(supportTitle,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        },
        "-=0.4"
      )
    }

    // Animar subtítulo
    if (supportSubtitle) {
      tl.fromTo(supportSubtitle,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.6"
      )
    }

    // Animar formulario
    if (supportForm) {
      tl.fromTo(supportForm,
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        "-=0.4"
      )

      // Animar campos del formulario con stagger
      const formFields = supportForm.querySelectorAll('input, select, textarea, button')
      if (formFields.length > 0) {
        tl.fromTo(formFields,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: {
              amount: 0.6,
              from: "start"
            }
          },
          "-=0.6"
        )
      }
    }

    // Animar tarjetas de contacto con efectos más sutiles
    if (contactCards.length > 0) {
      tl.fromTo(contactCards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: {
            amount: 0.2,
            from: "start"
          }
        },
        "-=0.3"
      )
    }

    return tl
  }





  animateWelcomeElements() {
    const tl = gsap.timeline()

    tl.to('#welcome-logo', { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" })
      .to('#welcome-title', { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
      .to('#welcome-subtitle', { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .to('#explore-apps-btn', { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.3")
  }

  animateApplicationsElements() {
    const tl = gsap.timeline()

    tl.to('#apps-title', { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
      .to('#apps-subtitle', { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .to('#search-section', { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
      .to('#filters', { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
      .to('#back-to-welcome-btn', { opacity: 1, x: 0, duration: 0.6 }, "-=0.5")

    // Las aplicaciones ya están cargadas y renderizadas
    // Solo animar las cards si existen
    if (state.applications.length > 0) {
      console.log('✅ Aplicaciones ya cargadas, animando tarjetas existentes')
      setTimeout(() => {
        this.animateApplicationCards()
      }, 600) // Delay mayor para que terminen las animaciones de elementos
    }
  }

  setupScrollAnimations() {
    // Animaciones de scroll para secciones
    gsap.utils.toArray('.opacity-0').forEach(element => {
      if (!element.closest('#loading-screen')) {
        gsap.fromTo(element, 
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        )
      }
    })
  }

  handleSearch(query) {
    const filtered = notionService.searchApplications(query)

    state.filteredApplications = filtered
    state.cardsAnimated = false // Resetear para permitir nueva animación
    this.renderApplications()

    // Animar las nuevas tarjetas filtradas
    setTimeout(() => {
      this.animateApplicationCards()
    }, 100)
  }

  handleFilter(filter) {
    console.log('🎯 Aplicando filtro:', filter)

    // Actualizar estado del filtro actual
    state.currentFilter = filter

    // Actualizar estado visual de todos los botones de filtro
    this.updateFilterButtonsState(filter)

    // Filtrar aplicaciones
    state.filteredApplications = notionService.getApplicationsByCategory(filter)
    state.cardsAnimated = false // Resetear para permitir nueva animación

    this.renderApplications()

    // Animar las nuevas tarjetas filtradas
    setTimeout(() => {
      this.animateApplicationCards()
    }, 100)
  }

  // Actualizar estado visual de los botones de filtro
  updateFilterButtonsState(activeFilter) {
    const filterButtons = document.querySelectorAll('.filter-btn')

    filterButtons.forEach(btn => {
      const isActive = btn.dataset.filter === activeFilter

      // Remover clases de estado anterior
      btn.classList.remove('active', 'bg-primary', 'text-primary-foreground', 'bg-muted', 'text-foreground')

      if (isActive) {
        // Aplicar estilos de botón activo
        btn.classList.add('active', 'bg-primary', 'text-primary-foreground')
        btn.classList.remove('hover:bg-accent')
      } else {
        // Aplicar estilos de botón inactivo
        btn.classList.add('bg-muted', 'text-foreground', 'hover:bg-accent')
      }
    })

    console.log('✅ Estados de filtros actualizados - Activo:', activeFilter)
  }

  handleApplicationClick(app, cardElement) {
    // Animación de click sutil y profesional
    gsap.to(cardElement, {
      scale: 0.98,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: () => {
        // Validar y abrir aplicación
        if (app.url && app.url !== '#') {
          if (CONFIG.security.validateUrls && !isTrustedUrl(app.url)) {
            toast.show('URL no confiable', 'error', 3000)
            return
          }

          if (CONFIG.security.openInNewTab) {
            window.open(app.url, '_blank')
          } else {
            window.location.href = app.url
          }

          toast.show(CONFIG.messages.appOpening.replace('{app}', app.title), 'success', 2000)
        } else {
          toast.show(CONFIG.messages.urlNotConfigured, 'warning', 3000)
        }
      }
    })
  }

  animateThemeTransition() {
    gsap.to('body', {
      duration: 0.3,
      ease: "power2.inOut"
    })
  }



  showErrorMessage(message) {
    const grid = document.getElementById('applications-grid')
    const loading = document.getElementById('apps-loading')

    loading.style.display = 'none'
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-destructive text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-semibold text-foreground mb-2">Error al cargar aplicaciones</h3>
        <p class="text-muted-foreground mb-4">${message}</p>
        <button onclick="location.reload()" class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Reintentar
        </button>
      </div>
    `
  }

  setupSupportForm() {
    const form = document.getElementById('support-form')
    const submitBtn = document.getElementById('submit-support-btn')
    const resetBtn = document.getElementById('reset-support-btn')

    if (!form) return

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      // Obtener datos del formulario (campos simplificados)
      const formData = new FormData(form)
      const data = {
        userName: formData.get('userName'),
        userEmail: formData.get('userEmail'),
        requestType: formData.get('requestType'),
        messageDescription: formData.get('messageDescription'),
        timestamp: new Date().toISOString()
      }

      // Validar datos con el servicio de soporte
      const validationErrors = supportService.validateFormData(data)
      if (validationErrors.length > 0) {
        toast.show(validationErrors[0], 'error', 4000)
        return
      }

      // Mostrar estado de carga
      this.showSupportFormStatus('loading')
      submitBtn.disabled = true

      try {
        // Enviar a Notion usando el servicio de soporte
        const result = await supportService.submitSupportRequest(data)

        if (result.success) {
          this.showSupportFormStatus('success')
          form.reset()
          toast.show('¡Solicitud enviada exitosamente! Te contactaremos pronto.', 'success', 5000)
        } else {
          throw new Error('Error en el envío')
        }
      } catch (error) {
        console.error('❌ Error al enviar formulario de soporte:', error)
        this.showSupportFormStatus('error', error.message)
        toast.show('Error al enviar la solicitud. Por favor, intenta nuevamente.', 'error', 5000)
      } finally {
        submitBtn.disabled = false
      }
    })

    // Manejar botón de reset
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset()
        this.hideSupportFormStatus()
        toast.show('Formulario limpiado', 'info', 2000)
      })
    }

    // Validación en tiempo real del mensaje
    const messageTextarea = document.getElementById('message-description')
    if (messageTextarea) {
      messageTextarea.addEventListener('input', (e) => {
        const length = e.target.value.length
        const minLength = CONFIG.support.form.minMessageLength
        const maxLength = CONFIG.support.form.maxMessageLength

        if (length < minLength) {
          e.target.setCustomValidity(`Mínimo ${minLength} caracteres`)
        } else if (length > maxLength) {
          e.target.setCustomValidity(`Máximo ${maxLength} caracteres`)
        } else {
          e.target.setCustomValidity('')
        }
      })
    }
  }



  showSupportFormStatus(type, message = '') {
    const statusDiv = document.getElementById('support-form-status')
    const loadingDiv = document.getElementById('support-form-loading')
    const successDiv = document.getElementById('support-form-success')
    const errorDiv = document.getElementById('support-form-error')
    const errorMessage = document.getElementById('support-error-message')

    // Ocultar todos los estados
    loadingDiv.classList.add('hidden')
    successDiv.classList.add('hidden')
    errorDiv.classList.add('hidden')

    // Mostrar el estado correspondiente
    statusDiv.classList.remove('hidden')

    switch (type) {
      case 'loading':
        loadingDiv.classList.remove('hidden')
        break
      case 'success':
        successDiv.classList.remove('hidden')
        break
      case 'error':
        errorDiv.classList.remove('hidden')
        if (message && errorMessage) {
          errorMessage.textContent = message
        }
        break
    }
  }

  hideSupportFormStatus() {
    const statusDiv = document.getElementById('support-form-status')
    if (statusDiv) {
      statusDiv.classList.add('hidden')
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Iniciando Centro de Aplicaciones')

  // Test de accesibilidad de imágenes
  const testImage = new Image()
  testImage.onload = () => {
    console.log('✅ Imagen logoacreditacion.png es accesible')
  }
  testImage.onerror = () => {
    console.error('❌ Error: No se puede cargar logoacreditacion.png')
    console.error('🔍 Verifica que el archivo esté en /public/logoacreditacion.png')
  }
  testImage.src = '/logoacreditacion.png'

  new AppCenter()
})

// Exportar para uso global si es necesario
window.AppCenter = AppCenter
