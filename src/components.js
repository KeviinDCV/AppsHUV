// Componentes reutilizables para el centro de aplicaciones
import { gsap } from 'gsap'

// Componente de notificación toast
export class Toast {
  constructor() {
    this.container = this.createContainer()
    document.body.appendChild(this.container)
  }

  createContainer() {
    const container = document.createElement('div')
    container.className = 'fixed top-4 right-4 z-50 space-y-2'
    container.id = 'toast-container'
    return container
  }

  show(message, type = 'info', duration = 3000) {
    const toast = this.createToast(message, type)
    this.container.appendChild(toast)

    // Animación de entrada
    gsap.fromTo(toast, 
      { opacity: 0, x: 100, scale: 0.8 },
      { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
    )

    // Auto-remove después del tiempo especificado
    setTimeout(() => {
      this.remove(toast)
    }, duration)

    return toast
  }

  createToast(message, type) {
    const toast = document.createElement('div')
    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white'
    }

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }

    toast.className = `${colors[type]} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 min-w-[300px] cursor-pointer`
    toast.innerHTML = `
      <span class="text-lg">${icons[type]}</span>
      <span class="flex-1">${message}</span>
      <button class="text-lg hover:opacity-70 transition-opacity">×</button>
    `

    // Evento para cerrar manualmente
    toast.addEventListener('click', () => this.remove(toast))

    return toast
  }

  remove(toast) {
    gsap.to(toast, {
      opacity: 0,
      x: 100,
      scale: 0.8,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }
    })
  }
}

// Componente de modal
export class Modal {
  constructor() {
    this.overlay = null
    this.modal = null
  }

  show(title, content, options = {}) {
    this.create(title, content, options)
    document.body.appendChild(this.overlay)
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden'

    // Animación de entrada
    gsap.fromTo(this.overlay, 
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    )

    gsap.fromTo(this.modal, 
      { opacity: 0, scale: 0.8, y: 50 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
    )
  }

  create(title, content, options) {
    // Overlay
    this.overlay = document.createElement('div')
    this.overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
    
    // Modal
    this.modal = document.createElement('div')
    this.modal.className = 'bg-card border border-border rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden'
    
    // Header
    const header = document.createElement('div')
    header.className = 'flex items-center justify-between p-6 border-b border-border'
    header.innerHTML = `
      <h3 class="text-lg font-semibold text-card-foreground">${title}</h3>
      <button class="text-muted-foreground hover:text-foreground transition-colors text-xl" id="modal-close">×</button>
    `

    // Content
    const contentDiv = document.createElement('div')
    contentDiv.className = 'p-6 overflow-y-auto'
    contentDiv.innerHTML = content

    // Footer (si se proporciona)
    let footer = null
    if (options.footer) {
      footer = document.createElement('div')
      footer.className = 'flex justify-end space-x-2 p-6 border-t border-border'
      footer.innerHTML = options.footer
    }

    // Ensamblar modal
    this.modal.appendChild(header)
    this.modal.appendChild(contentDiv)
    if (footer) this.modal.appendChild(footer)
    
    this.overlay.appendChild(this.modal)

    // Eventos de cierre
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close()
    })

    header.querySelector('#modal-close').addEventListener('click', () => this.close())

    // Cerrar con ESC
    document.addEventListener('keydown', this.handleEscape.bind(this))
  }

  handleEscape(e) {
    if (e.key === 'Escape') {
      this.close()
    }
  }

  close() {
    if (!this.overlay) return

    // Animación de salida
    gsap.to(this.modal, {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.3,
      ease: "power2.in"
    })

    gsap.to(this.overlay, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay)
        }
        document.body.style.overflow = ''
        document.removeEventListener('keydown', this.handleEscape.bind(this))
      }
    })
  }
}

// Componente de loading spinner
export class LoadingSpinner {
  constructor(container, message = 'Cargando...') {
    this.container = container
    this.message = message
    this.spinner = null
  }

  show() {
    this.spinner = document.createElement('div')
    this.spinner.className = 'flex flex-col items-center justify-center py-12'
    this.spinner.innerHTML = `
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-muted-foreground">${this.message}</p>
    `

    this.container.appendChild(this.spinner)

    // Animación de entrada
    gsap.fromTo(this.spinner, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 }
    )
  }

  hide() {
    if (this.spinner) {
      gsap.to(this.spinner, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          if (this.spinner && this.spinner.parentNode) {
            this.spinner.parentNode.removeChild(this.spinner)
          }
        }
      })
    }
  }

  updateMessage(message) {
    if (this.spinner) {
      const textElement = this.spinner.querySelector('p')
      if (textElement) {
        textElement.textContent = message
      }
    }
  }
}

// Componente de búsqueda avanzada
export class SearchComponent {
  constructor(container, onSearch) {
    this.container = container
    this.onSearch = onSearch
    this.searchInput = null
    this.suggestions = []
    this.init()
  }

  init() {
    this.createSearchInput()
    this.setupEvents()
  }

  createSearchInput() {
    const searchContainer = document.createElement('div')
    searchContainer.className = 'relative'
    
    this.searchInput = document.createElement('input')
    this.searchInput.type = 'text'
    this.searchInput.placeholder = 'Buscar aplicaciones...'
    this.searchInput.className = 'w-full px-4 py-2 pl-10 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'

    const searchIcon = document.createElement('div')
    searchIcon.className = 'absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'
    searchIcon.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    `

    searchContainer.appendChild(searchIcon)
    searchContainer.appendChild(this.searchInput)
    this.container.appendChild(searchContainer)
  }

  setupEvents() {
    let debounceTimer
    
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        this.onSearch(e.target.value)
      }, 300)
    })

    this.searchInput.addEventListener('focus', () => {
      gsap.to(this.searchInput, {
        scale: 1.02,
        duration: 0.2,
        ease: "power2.out"
      })
    })

    this.searchInput.addEventListener('blur', () => {
      gsap.to(this.searchInput, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      })
    })
  }

  clear() {
    this.searchInput.value = ''
    this.onSearch('')
  }

  focus() {
    this.searchInput.focus()
  }
}

// Utilidades de animación
export const AnimationUtils = {
  // Animación de entrada stagger para elementos
  staggerIn(elements, options = {}) {
    // Verificar que existan elementos
    if (!elements || elements.length === 0) {
      console.log('⚠️ AnimationUtils.staggerIn: No hay elementos para animar')
      return
    }

    const defaults = {
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)",
      from: { opacity: 0, y: 50, scale: 0.9 },
      to: { opacity: 1, y: 0, scale: 1 }
    }

    const config = { ...defaults, ...options }

    console.log(`🎬 AnimationUtils.staggerIn: Animando ${elements.length} elementos`)

    gsap.fromTo(elements, config.from, {
      ...config.to,
      duration: config.duration,
      stagger: config.stagger,
      ease: config.ease
    })
  },

  // Animación de hover para cards
  cardHover(card) {
    const tl = gsap.timeline({ paused: true })
    
    tl.to(card, {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      duration: 0.3,
      ease: "power2.out"
    })

    card.addEventListener('mouseenter', () => tl.play())
    card.addEventListener('mouseleave', () => tl.reverse())
  },

  // Animación de pulso para elementos importantes
  pulse(element, options = {}) {
    const defaults = {
      scale: 1.05,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    }
    
    const config = { ...defaults, ...options }
    
    gsap.to(element, config)
  },

  // Animación de shake para errores
  shake(element) {
    gsap.to(element, {
      x: [-10, 10, -10, 10, 0],
      duration: 0.5,
      ease: "power2.inOut"
    })
  }
}

// Exportar instancia global del toast
export const toast = new Toast()
