"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, FileText, InfoIcon, Download } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { documentsService } from "@/lib/services/documents"
import { Loading } from "@/components/ui/loading"
import type { Document, DocumentType } from "@/lib/types"

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const countryName = user?.country?.name || "Your Country"

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const [documentsResponse, types] = await Promise.all([
        documentsService.getDocuments(),
        documentsService.getDocumentTypes(),
      ])
      setDocuments(documentsResponse.results)
      setDocumentTypes(types)
      setSelectedDocumentTypeId((current) => current || types[0]?.id || "")
      setError(null)
    } catch (err: unknown) {
      console.error("Failed to fetch documents:", err)
      const message = (err as { message?: string })?.message || "Failed to load documents. Please try again.";
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedDocumentTypeId) {
      setError("Please select a document type before uploading.")
      return
    }

    try {
      setIsUploading(true)
      await documentsService.uploadDocument(selectedDocumentTypeId, file)
      await loadDocuments()
      setError(null)
    } catch (err: unknown) {
      console.error("Failed to upload document:", err)
      const message = (err as { message?: string })?.message || "Failed to upload document. Please try again.";
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const blob = await documentsService.downloadDocument(doc.id)
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = doc.original_filename
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err: unknown) {
      console.error("Failed to download document:", err)
      const message = (err as { message?: string })?.message || "Failed to download document. Please try again.";
      setError(message)
    }
  }

  if (isLoading) {
    return <Loading message="Loading documents..." />
  }

  const selectedDocumentType = documentTypes.find((type) => type.id === selectedDocumentTypeId)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Documents for {countryName}</h1>
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Documents ({documents.length})</h2>

        {documents.length === 0 ? (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800">No documents uploaded yet.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3 mb-6">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#2f3090]" />
                  <div>
                    <p className="font-medium">{doc.original_filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.file_size / 1024).toFixed(1)} KB • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10"
                    onClick={() => handleDownloadDocument(doc)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="document_type">Document Type *</Label>
            <Select
              value={selectedDocumentTypeId}
              onValueChange={setSelectedDocumentTypeId}
              disabled={documentTypes.length === 0}
            >
              <SelectTrigger id="document_type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDocumentType?.description && (
              <p className="text-xs text-muted-foreground">{selectedDocumentType.description}</p>
            )}
            {documentTypes.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No document types are configured yet. Contact the organizers.
              </p>
            )}
          </div>
        </div>

        <div className="border-2 border-dashed rounded-lg p-8 text-center border-[#2f3090]/30">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="document-upload"
            disabled={isUploading || documentTypes.length === 0}
          />
          <label htmlFor="document-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-[#2f3090]/50" />
            <p className="font-medium mb-2">
              {isUploading ? "Uploading..." : "Upload documents"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
            <Button className="bg-[#2f3090] hover:bg-[#4547a9]" disabled={isUploading || documentTypes.length === 0}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Add Document"}
            </Button>
          </label>
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
