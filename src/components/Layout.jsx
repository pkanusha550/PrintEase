import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { ToastContainer } from "./Toast";
import { useToast } from "../hooks/useToast";
import { createContext } from "react";

export const ToastContext = createContext(null);

export default function Layout() {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <Navbar />
      <main className="min-h-screen">
        <Outlet context={{ toast }} />
      </main>
      <footer className="bg-gray-900 text-white mt-20" id="contact">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <NavLink
                to="/"
                className="text-2xl font-bold text-primary hover:scale-105 transition-transform duration-smooth inline-block mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
              >
                PrintEase
              </NavLink>
              <p className="text-gray-400">
                Smart online Xerox & printing across 20+ cities. Bulk,
                on-demand, or subscription — we've got you covered.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <p className="text-gray-400 mb-2">+91 95850 68767</p>
              <p className="text-gray-400">theresan@printease.in</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick links</h3>
              <div className="flex flex-col gap-2">
                <NavLink
                  to="/order"
                  className="text-gray-400 hover:text-primary transition-colors duration-smooth"
                >
                  New Order
                </NavLink>
                <a
                  href="#dealers"
                  className="text-gray-400 hover:text-primary transition-colors duration-smooth"
                >
                  Dealers
                </a>
                <a
                  href="#chatbot"
                  className="text-gray-400 hover:text-primary transition-colors duration-smooth"
                >
                  Chatbot
                </a>
                <a
                  href="#admin"
                  className="text-gray-400 hover:text-primary transition-colors duration-smooth"
                >
                  Admin Portal (coming soon)
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Follow</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors duration-smooth"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors duration-smooth"
                >
                  LinkedIn
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors duration-smooth"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-gray-400">
              © {new Date().getFullYear()} PrintEase. All rights reserved.
            </span>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-smooth"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-smooth"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-smooth"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </ToastContext.Provider>
  );
}
