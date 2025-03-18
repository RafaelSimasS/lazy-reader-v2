import React, { createContext, useContext, useEffect, useState } from "react";
import IndexedDBService from "@/service/indexedDb.service";
import { BookContextType, BookDetails, BookStored } from "@/types/types";

const BookContext = createContext<BookContextType | undefined>(undefined);

const indexedDBService = new IndexedDBService();

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [books, setBooks] = useState<BookDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [dbInit, setDbInit] = useState<boolean>(false);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await indexedDBService.openDatabase();
        setDbInit(true);
      } catch (err) {
        console.error(err);
        setError("Failed to open database");
      }
    };

    initializeDB();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (dbInit) {
        setIsFetching(true);
        try {
          const allBooks = await indexedDBService.getAllBooks();
          setBooks(allBooks);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch books");
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchBooks();
  }, [dbInit]);

  const addBook = async (file_name: string, epubBlob: Blob) => {
    try {
      await indexedDBService.addEpub(file_name, epubBlob);
      await refreshBooks();
    } catch (err) {
      console.error(err);
      setError("Failed to add book");
    }
  };

  const getBookById = async (id: string): Promise<BookStored | undefined> => {
    try {
      return await indexedDBService.getBookById(id);
    } catch (err) {
      console.error(err);
      setError("Failed to get book by id");
      return undefined;
    }
  };

  const removeBook = async (id: string) => {
    try {
      await indexedDBService.removeBook(id);
      await refreshBooks();
    } catch (err) {
      console.error(err);
      setError("Failed to remove book");
    }
  };

  const refreshBooks = async () => {
    try {
      const allBooks = await indexedDBService.getAllBooks();
      setBooks(allBooks);
    } catch (err) {
      console.error(err);
      setError("Failed to refresh books");
    }
  };

  return (
    <BookContext.Provider
      value={{
        books,
        error,
        isFetching,
        addBook,
        getBookById,
        removeBook,
        refreshBooks,
        dbInit,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
};
