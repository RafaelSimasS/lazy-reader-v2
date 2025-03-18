"use client";
import React from "react";
import { CircleHelp, Menu, Moon, Sun, X } from "lucide-react";
import {
  HybridTooltip,
  TouchProvider,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "@/components/ui/hybridTooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import AddBookButton from "@/components/AddBookButton";
import { toggleTheme } from "@/lib/utils";
interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState("light");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);
  return (
    <nav className="bg-transparent p-4 flex flex-col lg:flex-row justify-between items-center text-gray-500 dark:text-gray-300 border-b lg:border-b-2 border-gray-400 lg:border-gray-300 relative">
      {/* Div principal para exibir o botão de hambúrguer em telas pequenas */}
      <div className="flex items-center justify-between w-full lg:w-auto">
        LazyReader
        <Button
          className="lg:hidden flex items-center justify-center p-2 rounded hover:bg-gray-200 bg-button-light dark:bg-button-dark"
          aria-label="Toggle menu"
          onClick={toggleMenu}
        >
          {!isMenuOpen ? <Menu /> : <X />}
        </Button>
      </div>
      {/* Container do menu, que se torna visível ou oculto com base no estado */}
      <div
        className={`lg:flex ${
          isMenuOpen ? "block" : "hidden"
        } lg:items-center lg:w-auto w-full`}
      >
        <div className="flex flex-col lg:flex-row items-center space-x-4 mt-4 lg:mt-0">
          <AddBookButton />

          <div className="flex items-center space-x-2 mt-4 lg:mt-0">
            <Button
              onClick={() => {
                toggleTheme("dark");
                setTheme("dark");
              }}
              className={`p-2 rounded hover:bg-button-light-hover active:bg-button-light-hover cursor-pointer ${
                theme === "dark" ? "bg-button-light" : "bg-button-dark"
              }`}
              aria-label="Dark theme"
            >
              <Moon className="text-xl size-6" />
            </Button>

            <Button
              onClick={() => {
                toggleTheme("light");
                setTheme("light");
              }}
              className={`p-2 rounded hover:bg-button-light-hover active:bg-button-light-hover cursor-pointer ${
                theme === "light" ? "bg-button-light" : "bg-button-dark"
              }`}
              aria-label="Light theme"
            >
              <Sun className="text-xl size-6" />
            </Button>
          </div>

          <TouchProvider>
            <TooltipProvider>
              <HybridTooltip>
                <HybridTooltipTrigger>
                  <div className="flex items-center space-x-4 mt-4 md:mt-0 ">
                    <p className="text-inherit text-sm">Cached Books</p>
                    <CircleHelp className="text-inherit text-sm" />
                  </div>
                </HybridTooltipTrigger>
                <HybridTooltipContent className="w-full max-w-xs md:max-w-sm lg:max-w-md text-justify text-sm md:text-base md:text-center">
                  <span>
                    Your books are saved in the browser as cached data. Cached
                    Data is automatically and irregularly deleted according to
                    the browser storage space, not recommended to store too much
                    data.
                  </span>
                </HybridTooltipContent>
              </HybridTooltip>
            </TooltipProvider>
          </TouchProvider>
        </div>
      </div>
      {children}
    </nav>
  );
};

export default Navbar;
