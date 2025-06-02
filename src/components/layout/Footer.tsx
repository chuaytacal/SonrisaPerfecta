export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-secondary text-secondary-foreground py-8 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} Sonrisa Perfecta. Todos los derechos reservados.</p>
        <p className="text-sm mt-1">
          Calle Falsa 123, Ciudad Ejemplo | Tel: (555) 123-4567
        </p>
      </div>
    </footer>
  );
}
