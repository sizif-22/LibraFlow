'use client';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, useSidebar } from '@/components/ui/sidebar';

interface UserProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout?: () => void;
}

export function NavUser({ user, onLogout }: UserProps) {
  return (
    <SidebarProvider>
        <SidebarMenu>
      <SidebarMenuItem >
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className="w-full flex h-16 items-center gap-3 p-2 rounded-[8px] hover:bg-[#1a1a1a] transition-colors border border-transparent hover:border-[#333333] text-left outline-none"
        >
          <Avatar className="h-8 w-8 rounded-[6px] border border-[#333333]">
            <AvatarFallback className="rounded-[6px] bg-[#222222] text-white text-[12px] font-[600]">
              {user?.firstName?.slice(0, 2)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 leading-tight">
            <span className="truncate text-[13px] font-[600] text-white">
              {user?.firstName + ' '}{user?.lastName ?? ""}
            </span>
            <span className="truncate text-[11px] text-[#888888]">
              {user?.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-[#666666]" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        className="w-[220px] rounded-[8px] bg-[#1a1a1a] border-[#333333] text-white shadow-2xl py-1 z-50"
        side="right"
        align="end"
        sideOffset={16}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-3 py-2.5 text-left">
            <Avatar className="h-8 w-8 rounded-[6px] border border-[#333333]">
              <AvatarFallback className="rounded-[6px] bg-[#222222] text-white text-[12px] font-[600]">
                {user?.firstName?.slice(0, 2)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 leading-tight">
              <span className="truncate text-[13px] font-[600] text-white">
                {user?.firstName + ' '}{user?.lastName ?? ""}
              </span>
              <span className="truncate text-[11px] text-[#888888]">
                {user?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-[#333333] my-1" />
        
        <DropdownMenuItem 
          onClick={() => {
            if (onLogout) onLogout();
          }}
          className="px-3 py-2 cursor-pointer focus:bg-[#222222] focus:text-white rounded-[6px] m-1 flex items-center gap-2 text-[13px] text-[#aaaaaa]"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
          </SidebarMenuItem>
    </SidebarMenu>
    </SidebarProvider>
  );
}