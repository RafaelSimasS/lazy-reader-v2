"use client";
import AddBookButton from "@/components/AddBookButton";
import BookCard from "@/components/BookCard/BookCard";
import Navbar from "@/components/NavBar/Navbar";
import { useBooks } from "@/context/BookContext";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function Home() {
  const { books, error, isFetching, removeBook } = useBooks();
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    document.title = "Lazy Reader - Home";
  }, []);

  if (isFetching) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <div className="text-gray-500 dark:text-gray-300">
            Loading books...
          </div>
        </main>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-between p-24 text-gray-500 dark:text-gray-300">
          <div className="text-inherit dark:text-inherit">{error}</div>
        </main>
      </>
    );
  }
  if (!(books.length > 0)) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-between p-24 text-gray-500 dark:text-gray-300">
          <div className="text-inherit dark:text-inherit">
            <div className="w-full max-w-xs md:max-w-sm lg:max-w-md text-inherit dark:text-inherit max-w text-center md:text-left">
              <p>No books found.</p>
              <AddBookButton />
            </div>
          </div>
        </main>
      </>
    );
  }

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDelete = async (id: string) => {
    try {
      await removeBook(id);
      toast.success("Book removed successfully.", {
        description: "The book was removed from your library.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove book.", {
        description: "There was an error while removing the book.",
      });
    }
  };
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-start justify-start p-2 text-gray-500 dark:text-gray-300">
        <div className="w-full p-4">
          <h1 className="text-3xl font-bold mb-4">Minha Biblioteca</h1>
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="Search book by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded w-[30%]"
            />
            <AddBookButton />
          </div>
        </div>
        <div className="grid grid-cols-2 mt-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-6">
          {filteredBooks.map((book, index) => (
            <BookCard book={book} handleDelete={handleDelete} key={index} />
          ))}
        </div>
        <Toaster />
      </main>
    </>
  );
}
