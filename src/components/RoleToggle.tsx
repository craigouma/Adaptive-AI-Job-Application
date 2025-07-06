import React from 'react';
import { Code, Palette, Server, Layers, BarChart3, Settings, User, Smartphone, Bug, ChevronDown } from 'lucide-react';
import { ROLES, ROLE_LABELS, Role } from '../types';

interface RoleToggleProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({ role, onRoleChange }) => {
  const getRoleIcon = (roleKey: Role) => {
    switch (roleKey) {
      case 'frontend-engineer':
        return <Code className="w-4 h-4" />;
      case 'product-designer':
        return <Palette className="w-4 h-4" />;
      case 'backend-engineer':
        return <Server className="w-4 h-4" />;
      case 'fullstack-engineer':
        return <Layers className="w-4 h-4" />;
      case 'data-scientist':
        return <BarChart3 className="w-4 h-4" />;
      case 'devops-engineer':
        return <Settings className="w-4 h-4" />;
      case 'product-manager':
        return <User className="w-4 h-4" />;
      case 'ui-ux-designer':
        return <Palette className="w-4 h-4" />;
      case 'mobile-developer':
        return <Smartphone className="w-4 h-4" />;
      case 'qa-engineer':
        return <Bug className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getRoleColor = (roleKey: Role) => {
    switch (roleKey) {
      case 'frontend-engineer':
        return 'text-blue-600';
      case 'product-designer':
        return 'text-purple-600';
      case 'backend-engineer':
        return 'text-green-600';
      case 'fullstack-engineer':
        return 'text-indigo-600';
      case 'data-scientist':
        return 'text-orange-600';
      case 'devops-engineer':
        return 'text-gray-600';
      case 'product-manager':
        return 'text-red-600';
      case 'ui-ux-designer':
        return 'text-pink-600';
      case 'mobile-developer':
        return 'text-cyan-600';
      case 'qa-engineer':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="flex items-center justify-center mb-6 sm:mb-8 px-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 w-full max-w-sm sm:max-w-md">
        <div className="relative">
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="w-full appearance-none bg-transparent px-3 sm:px-4 py-3 pr-10 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-base touch-manipulation"
          >
            {ROLES.map((roleKey) => (
              <option key={roleKey} value={roleKey}>
                {ROLE_LABELS[roleKey]}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {/* Selected role display with icon */}
        <div className="flex items-center justify-center mt-2 pb-1 sm:pb-2">
          <div className={`flex items-center space-x-2 ${getRoleColor(role)}`}>
            {getRoleIcon(role)}
            <span className="text-sm sm:text-base font-medium">{ROLE_LABELS[role]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};