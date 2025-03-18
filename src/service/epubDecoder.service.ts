import {
  EpubBook,
  EpubManifestItem,
  EpubMetadata,
  EpubPackage,
  EpubSpineItem,
} from "@/types/types";
import JSZip from "jszip";

export async function readEpub(file: Blob): Promise<EpubBook> {
  // 1. Ler o arquivo como ArrayBuffer e carregar o ZIP
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 2. Ler o container.xml que informa onde está o arquivo OPF
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) {
    throw new Error("Failed to load your EPUB file: container.xml not found.");
  }
  const containerXml = await containerFile.async("string");

  // Parse do container.xml
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, "application/xml");
  const rootfile = containerDoc.querySelector("rootfile");
  if (!rootfile) {
    throw new Error("Elemento <rootfile> não encontrado em container.xml.");
  }
  const opfPath = rootfile.getAttribute("full-path");
  if (!opfPath) {
    throw new Error("Caminho para o arquivo OPF não especificado.");
  }

  // 3. Ler o arquivo OPF
  const opfFile = zip.file(opfPath);
  if (!opfFile) {
    throw new Error(`Arquivo OPF não encontrado em: ${opfPath}`);
  }
  const opfXml = await opfFile.async("string");

  // Parse do OPF (package)
  const opfDoc = parser.parseFromString(opfXml, "application/xml");
  if (opfDoc.querySelector("parsererror")) {
    throw new Error("Erro ao parsear o arquivo OPF.");
  }

  const packageElement = opfDoc.querySelector("package");
  if (!packageElement) {
    throw new Error("Elemento <package> não encontrado no arquivo OPF.");
  }

  // 4. Parsing dos metadados
  const metadata: EpubMetadata = {};
  const metadataElement = packageElement.querySelector("metadata");
  if (metadataElement) {
    // Extraindo título (tentamos os seletores com e sem prefixo "dc:")
    const titleElement =
      metadataElement.querySelector("dc\\:title") ||
      metadataElement.querySelector("title");
    if (titleElement && titleElement.textContent) {
      metadata.title = titleElement.textContent.trim();
    }

    // Extraindo idioma
    const languageElement =
      metadataElement.querySelector("dc\\:language") ||
      metadataElement.querySelector("language");
    if (languageElement && languageElement.textContent) {
      metadata.language = languageElement.textContent.trim();
    }

    // Extraindo autor/criador
    const creatorElement =
      metadataElement.querySelector("dc\\:creator") ||
      metadataElement.querySelector("creator");
    if (creatorElement && creatorElement.textContent) {
      metadata.creator = creatorElement.textContent.trim();
    }
  }

  // 5. Parsing do manifest
  const manifest: EpubManifestItem[] = [];
  const manifestElement = packageElement.querySelector("manifest");
  if (manifestElement) {
    const itemElements = manifestElement.querySelectorAll("item");
    itemElements.forEach((item) => {
      const id = item.getAttribute("id") || "";
      const href = item.getAttribute("href") || "";
      const mediaType = item.getAttribute("media-type") || "";
      if (id && href && mediaType) {
        manifest.push({
          id,
          href,
          mediaType: mediaType,
        });
      }
    });
  }

  // 6. Parsing do spine (ordem de leitura)
  const spine: EpubSpineItem[] = [];
  const spineElement = packageElement.querySelector("spine");
  if (spineElement) {
    const itemrefElements = spineElement.querySelectorAll("itemref");
    itemrefElements.forEach((itemref) => {
      const idref = itemref.getAttribute("idref") || "";
      const linear = itemref.getAttribute("linear") || "yes"; // padrão é "yes"
      if (idref) {
        spine.push({
          idref,
          linear,
        });
      }
    });
  }

  // 7. Tentar extrair a capa
  let coverUrl: string | null = null;
  // Primeiro, procurar a meta tag que define a capa
  let coverId: string | null = null;
  if (metadataElement) {
    const metaCover = metadataElement.querySelector('meta[name="cover"]');
    if (metaCover) {
      coverId = metaCover.getAttribute("content");
    }
  }
  // Se não encontrou via meta, tenta buscar por itens com id "cover" ou "cover-image"
  if (!coverId) {
    const possibleCover = manifest.find(
      (item) =>
        item.id.toLowerCase() === "cover" ||
        item.id.toLowerCase() === "cover-image"
    );
    if (possibleCover) {
      coverId = possibleCover.id;
    }
  }

  if (coverId) {
    const coverItem = manifest.find((item) => item.id === coverId);
    if (coverItem) {
      // Como o href é relativo ao OPF, calculamos o diretório base:
      const basePath = opfPath.includes("/")
        ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1)
        : "";
      const coverFilePath = basePath + coverItem.href;
      const coverFile = zip.file(coverFilePath);
      if (coverFile) {
        const blob = await coverFile.async("blob");
        coverUrl = URL.createObjectURL(blob);
      }
    }
  }

  const epubPackage: EpubPackage = {
    metadata,
    manifest,
    spine,
  };

  return {
    package: epubPackage,
    coverUrl,
  };
}
