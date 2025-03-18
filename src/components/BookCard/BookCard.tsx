import { toast } from "sonner";
import { BookDetails } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import { Trash } from "lucide-react";

interface BookCardProps {
  book: BookDetails;
  handleDelete: (id: string) => void;
}

const BookCard = ({ book, handleDelete }: BookCardProps) => {
  const truncateFlag = 49;
  const truncatedTitle =
    book.title.length > truncateFlag
      ? `${book.title.slice(0, truncateFlag)}...`
      : book.title;
  return (
    <Link
      className="flex flex-col items-center w-full transform transition-transform duration-300 hover:scale-105 active:scale-105 hover:cursor-pointer select-none"
      title={book.title}
      href={`/read/${book.id}`}
      onClick={() => {
        toast("Opening...", {
          description: "Your book is being loaded.",
          className: "dark:bg-default-dark bg-soft-white",
          duration: 900,
        });
      }}
    >
      <div className="relative w-32 h-48 sm:w-40 sm:h-60 group">
        <button
          type="button"
          className="absolute -top-2 -right-2 block md:hidden bg-white dark:bg-gray-800 rounded-full p-1 shadow hover:bg-gray-200 dark:hover:bg-gray-700 z-50 cursor-pointer border border-gray-400"
          title="Delete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(book.id);
          }}
        >
          <Trash className="size-6 text-gray-600 dark:text-gray-300" />
        </button>
        {/* Botão de delete para desktop (aparece somente no hover) */}
        <button
          type="button"
          className="absolute -top-4 -right-4 hidden group-hover:block bg-white dark:bg-gray-800 rounded-full p-1 shadow hover:bg-gray-200 dark:hover:bg-gray-700 z-50 cursor-pointer border border-gray-400"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(book.id);
          }}
          title="Delete"
        >
          <Trash className="size-6 text-gray-600 dark:text-gray-300" />
        </button>
        <Image
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          layout="fill"
          className="rounded-lg shadow-2xl dark:shadow-gray-600 object-fill"
        />
      </div>
      {/* Elemento extra para a sombra circular */}
      <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-full h-4 bg-black dark:bg-gray-500 opacity-30 rounded-full filter blur-md"></span>
      <p className="mt-2 text-center text-wrap text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
        {truncatedTitle}
      </p>
    </Link>
  );
};

export default BookCard;
