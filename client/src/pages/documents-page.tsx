
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, Trash2, Search, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to upload document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setSelectedFile(null);
    },
  });

  const filteredDocuments = documents.filter((doc: Document) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "xlsx":
      case "xls":
        return "📊";
      case "docx":
      case "doc":
        return "📝";
      case "zip":
      case "rar":
        return "🗜️";
      default:
        return "📁";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-800";
      case "xlsx":
      case "xls":
        return "bg-green-100 text-green-800";
      case "docx":
      case "doc":
        return "bg-blue-100 text-blue-800";
      case "zip":
      case "rar":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documentos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload de Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mb-2"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>
              <Button
                onClick={() => selectedFile && uploadMutation.mutate(selectedFile)}
                disabled={!selectedFile || uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? "Enviando..." : "Enviar Documento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Pesquisar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc: Document) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(doc.type)}</span>
                    <div>
                      <CardTitle className="text-sm font-medium truncate">
                        {doc.name}
                      </CardTitle>
                      <Badge className={`text-xs ${getTypeColor(doc.type)}`}>
                        {doc.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>{doc.uploadDate}</span>
                  <span>{doc.size}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="w-3 h-3 mr-1" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Tente ajustar sua pesquisa" : "Comece adicionando um documento"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
