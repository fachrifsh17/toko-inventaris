import { getPengaturan, getKategoriList } from "@/actions/public"
import NavbarPublic from "@/components/public/NavbarPublic"
import FooterPublic from "@/components/public/FooterPublic"

export const dynamic = 'force-dynamic'

export default async function PublicLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [pengaturan, kategoriList] = await Promise.all([
    getPengaturan(),
    getKategoriList()
  ])

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <NavbarPublic pengaturan={pengaturan} kategoriList={kategoriList} />
      <main className="flex-1">{children}</main>
      <FooterPublic pengaturan={pengaturan} kategoriList={kategoriList} />
    </div>
  )
}