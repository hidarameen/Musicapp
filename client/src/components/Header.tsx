import { useState, useEffect } from "react";
import React from "react";
import { ChevronLeft, ChevronRight, Search, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Auto-search when debounced value changes
  React.useEffect(() => {
    if (debouncedSearchQuery.trim() && debouncedSearchQuery.length > 2) {
      navigate(`/search?q=${encodeURIComponent(debouncedSearchQuery.trim())}`);
    }
  }, [debouncedSearchQuery, navigate]);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-forward">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن الأغاني أو الفنانين..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              data-testid="input-search"
            />
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
