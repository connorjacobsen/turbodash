export default function Container({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 h-full max-w-screen-md mx-auto">{children}</div>;
}
