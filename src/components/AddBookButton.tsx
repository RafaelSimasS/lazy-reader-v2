import { BookPlus } from "lucide-react";
import React from "react";
import { useBooks } from "@/context/BookContext";
import { toast } from "sonner";
import { successToast } from "@/styles/tailwindClasses";

const AddBookButton = () => {
  const { addBook, refreshBooks } = useBooks();
  const [loading, setLoading] = React.useState(false);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/epub+zip") {
      toast.warning("Invalid format.", {
        description: "Only EPUB files are supported.",
      });
      return;
    }
    console.log(file);

    try {
      await addBook(file.name, file);
      refreshBooks();
      toast.success("Book added.", {
        description: "Your book was successfully added.",
        className: successToast,
      });
    } catch (error) {
      console.error("Failed to save and update books.", error);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <label
        htmlFor="file-upload"
        className="bg-button-light dark:bg-button-dark text-white py-2 px-4 rounded cursor-pointer flex items-center space-x-2"
        role="button"
      >
        <BookPlus className="text-white text-xl" />
        <span className="inline">Add Book</span>
        <input
          id="file-upload"
          type="file"
          accept=".epub"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {loading && <p className="text-gray-500">Uploading book...</p>}
    </>
  );
};

export default AddBookButton;
