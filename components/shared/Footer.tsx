'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-bg2">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <p className="text-xs text-muted mb-2">
          © {currentYear} Anime Online. Todos los derechos reservados.
        </p>
        <p className="text-xs text-muted-2">
          El contenido mostrado es indexado desde fuentes externas. No alojamos contenido protegido.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a href="#" className="text-xs text-primary hover:text-primary-dark transition">
            Términos
          </a>
          <span className="text-border">•</span>
          <a href="#" className="text-xs text-primary hover:text-primary-dark transition">
            Privacidad
          </a>
          <span className="text-border">•</span>
          <a href="#" className="text-xs text-primary hover:text-primary-dark transition">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  )
}
