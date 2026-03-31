import Hero from "@/components/home/Hero"
import EditorialSection from "@/components/home/EditorialSection"
import ConcursosSection from "@/components/home/ConcursosSection"
import AgrupacionesSection from "@/components/home/AgrupacionesSection"

export default function Home() {
  return (
    <>
      <Hero />
      <EditorialSection /> 
      <ConcursosSection />
      <AgrupacionesSection />
    </>
  )
}