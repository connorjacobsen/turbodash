import Header from "./header"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <Header />

      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  )
}