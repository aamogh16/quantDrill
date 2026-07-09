import { TopBar } from '../components/TopBar'

export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <TopBar title={title} />
      <div className="flex-1 flex items-center justify-center text-term-dim text-sm px-8 text-center">
        This mode is still being built.
      </div>
    </>
  )
}
