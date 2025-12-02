import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, InfoIcon } from "lucide-react"

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Documents for Uzbekistan</h1>
        </div>
        <p className="text-white/80">Use this to securely exchange documents with the host.</p>
      </div>

      <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
        <InfoIcon className="h-4 w-4 text-[#00795d]" />
        <AlertDescription className="text-[#00795d]">
          If the host has requested you to upload any documents here, please upload them below. You may also use this to
          store insurance or trip documentation in safe place.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Documents</h2>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">No documents yet.</AlertDescription>
        </Alert>

        <div className="border-2 border-dashed rounded-lg p-8 text-center border-[#2f3090]/30">
          <Upload className="w-12 h-12 mx-auto mb-4 text-[#2f3090]/50" />
          <p className="font-medium mb-2">Upload documents</p>
          <p className="text-sm text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
          <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
            <Upload className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-[#2f3090]/5 border-[#2f3090]/20">
        <h3 className="font-semibold mb-4">Document Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
          <li>Maximum file size: 10MB per document</li>
          <li>Documents are securely stored and only accessible to your delegation and organizers</li>
          <li>You can upload insurance documents, travel confirmations, or any other relevant files</li>
        </ul>
      </Card>
    </div>
  )
}
