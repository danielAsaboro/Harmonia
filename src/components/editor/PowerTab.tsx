import React from 'react';
import { 
  Lightbulb,
  SmilePlus,
  Reply,
  Heart,
  Eye,
  Expand,
  Sparkles
} from 'lucide-react';

interface ActionButtonProps {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, count, onClick }) => (
  <button 
    onClick={onClick}
    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-1 text-gray-400 hover:text-gray-200"
  >
    {icon}
    {count !== undefined && (
      <span className="text-sm">{count}</span>
    )}
  </button>
);

const ActionsMenu: React.FC = () => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
      <ActionButton 
        icon={<Sparkles className="w-5 h-5 text-purple-400" />} 
      />
      <ActionButton 
        icon={<Lightbulb className="w-5 h-5" />} 
      />
      <ActionButton 
        icon={<SmilePlus className="w-5 h-5" />} 
      />
      <ActionButton 
        icon={<Reply className="w-5 h-5" />} 
      />
      <ActionButton 
        icon={<Heart className="w-5 h-5" />}
        count={66}
      />
      <ActionButton 
        icon={<Eye className="w-5 h-5" />} 
      />
      <ActionButton 
        icon={<Expand className="w-5 h-5" />} 
      />
    </div>
  );
};

export default ActionsMenu;