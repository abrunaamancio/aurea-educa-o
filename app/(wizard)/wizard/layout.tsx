import { WizardLayout } from "@/components/wizard/WizardLayout"

export const dynamic = "force-dynamic"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <WizardLayout>{children}</WizardLayout>
}
