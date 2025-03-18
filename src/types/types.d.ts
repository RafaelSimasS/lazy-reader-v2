export interface EpubMetadata {
  title?: string;
  language?: string;
  creator?: string;
  // Adicione outros campos conforme necessário
  [key: string]: string | undefined;
}

export interface EpubManifestItem {
  id: string;
  href: string;
  mediaType: string;
}

export interface EpubSpineItem {
  idref: string;
  linear?: string;
}

export interface EpubPackage {
  metadata: EpubMetadata;
  manifest: EpubManifestItem[];
  spine: EpubSpineItem[];
}

export interface EpubBook {
  package: EpubPackage;
  coverUrl: string | null;
}

export interface BookStored {
  id: string;
  epubBlob: Blob;
}

export interface BookDetails {
  id: string;
  title: string;
  coverUrl: string;
}

export interface BookContextType {
  books: BookDetails[];
  error: string | null;
  isFetching: boolean;
  dbInit: boolean;
  addBook: (file_name: string, epubBlob: Blob) => Promise<void>;
  getBookById: (id: string) => Promise<BookStored | undefined>;
  removeBook: (id: string) => Promise<void>;
  refreshBooks: () => void;
}
