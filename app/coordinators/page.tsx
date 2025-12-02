import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, X, Users } from "lucide-react"

export default function CoordinatorsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Coordinators for Uzbekistan</h1>
        </div>
        <p className="text-white/80">The persons below can view and edit team information.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Coordinators</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Person</th>
                <th className="text-left py-3 font-medium">E-mail</th>
                <th className="text-left py-3 font-medium">Last seen</th>
                <th className="text-left py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-4 font-medium">Davron Tukhtaev</td>
                <td className="py-4">
                  <a href="mailto:toxtayev.davron@mail.ru" className="text-[#2f3090] hover:underline">
                    toxtayev.davron@mail.ru
                  </a>
                </td>
                <td className="py-4 text-muted-foreground">2026-03-18 14:03:48 (password)</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-[#2f3090] hover:bg-[#2f3090]/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
            <Plus className="w-4 h-4 mr-2" />
            Add coordinator
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-[#2f3090]/5 border-[#2f3090]/20">
        <h3 className="font-semibold mb-4">About Coordinators</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Coordinators have full access to manage delegation information</li>
          <li>They can add/edit participants, upload documents, and submit travel details</li>
          <li>Each coordinator receives their own login credentials</li>
          <li>You can add multiple coordinators for your delegation</li>
        </ul>
      </Card>
    </div>
  )
}
