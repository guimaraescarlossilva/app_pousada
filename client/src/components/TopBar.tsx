import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showNewButton?: boolean;
  onNewClick?: () => void;
}

export function TopBar({ title, subtitle, showNewButton = false, onNewClick }: TopBarProps) {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Hoje</p>
            <p className="text-lg font-semibold text-gray-900">{currentDate}</p>
          </div>
          {showNewButton && (
            <Button onClick={onNewClick} className="bg-primary text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Check-in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
