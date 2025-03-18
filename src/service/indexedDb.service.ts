import { hashFileName } from "@/lib/utils";
import { BookDetails, BookStored, EpubBook } from "@/types/types";
import { readEpub } from "./epubDecoder.service";

export default class IndexedDBService {
  private db: IDBDatabase | undefined;

  async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("BookDatabase", 1);
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore("BookStore", { keyPath: "id" });
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error?.message);
      };
    });
  }

  async addEpub(file_name: string, epubBlob: Blob): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) throw new Error("Database not opened.");
      const id = await hashFileName(file_name);
      const transaction = this.db.transaction(["BookStore"], "readwrite");
      const objectStore = transaction.objectStore("BookStore");
      const request = objectStore.put({ id, epubBlob });

      request.onsuccess = () => {
        console.log("Book saved!");
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getAllBooks(): Promise<BookDetails[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) throw new Error("Database not opened.");

      const transaction = this.db.transaction(["BookStore"], "readonly");
      const objectStore = transaction.objectStore("BookStore");
      const request = objectStore.getAll();

      request.onsuccess = async () => {
        const books = request.result as BookStored[];
        const booksWithDetails = await Promise.all(
          books.map(async (book: BookStored) => {
            try {
              const epubBook: EpubBook = await readEpub(book.epubBlob);
              const metadata = epubBook.package.metadata;
              const title = metadata.title || "Unknown Title";
              const coverUrl = epubBook.coverUrl || "";
              return {
                id: book.id,
                title,
                coverUrl,
              } as BookDetails;
            } catch (err) {
              console.error("Error reading EPUB:", err);
              return {
                id: book.id,
                title: "Erro ao carregar",
                coverUrl: "",
              } as BookDetails;
            }
          })
        );

        resolve(booksWithDetails);
        console.log("Books retrieved!", request.result);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async removeBook(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) throw new Error("Database not opened.");

      const transaction = this.db.transaction(["BookStore"], "readwrite");
      const objectStore = transaction.objectStore("BookStore");
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getBookById(id: string): Promise<BookStored | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) throw new Error("Database not opened.");

      const transaction = this.db.transaction(["BookStore"], "readonly");
      const objectStore = transaction.objectStore("BookStore");
      const request = objectStore.get(id);

      request.onsuccess = () => {
        const book = request.result;
        if (!book) {
          resolve(undefined);
        } else {
          const bookData: BookStored = {
            id: book.id,
            epubBlob: book.epubBlob,
          };
          resolve(bookData);
        }
      };
      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}
