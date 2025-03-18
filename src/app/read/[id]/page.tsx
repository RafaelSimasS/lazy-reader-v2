"use client";
import { Button } from "@/components/ui/button";
import { useBooks } from "@/context/BookContext";
import { readEpub } from "@/service/epubDecoder.service";
import { EpubBook } from "@/types/types";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}
function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { getBookById, dbInit } = useBooks();
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState<EpubBook | undefined>(undefined);
  const bookRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!dbInit) return;
      console.log(dbInit);
      try {
        const fetchedBook = await getBookById(id);
        if (!fetchedBook) {
          return;
        }
        const arrayBuffer = fetchedBook.epubBlob;
        const epub = await readEpub(arrayBuffer);
        document.title =
          "Reading | " + epub.package.metadata.title || "Unknown Book";
        setBook(epub);
      } catch (error) {
        console.error("Failed to fetch book", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, getBookById, dbInit]);

  if (loading || !dbInit) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500 dark:text-gray-300 text-center">
          Couldn&apos;t find your book.
        </div>
        <Button asChild className="mt-4">
          <Link href={"/"} replace>
            Return
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <div className="relative flex flex-col w-screen h-svh overflow-hidden">
      <div
        className={`dark:bg-default-dark p-3 flex flex-row justify-between items-center text-gray-500 dark:text-gray-300 border-b lg:border-b-2 border-gray-400 lg:border-gray-300 fixed top-0 w-full z-50 transition-transform duration-300`}
      ></div>
      <div
        ref={bookRef}
        className="flex w-full h-full mt-16 overflow-hidden"
      ></div>
    </div>
  );
}

export default Page;
