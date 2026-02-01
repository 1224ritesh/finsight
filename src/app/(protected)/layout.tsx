"use client";

import { Navbar } from "@/components/navbar";
import { Github, Linkedin } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1 mb-20">
        {children}
      </main>
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <p>
                © 2026 FinSight. Built by{" "}
                <span className="font-semibold">Ritesh Sharma</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/1224ritesh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="text-sm">GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/ritesh-sharma-a12063241/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="text-sm">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
