import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/pages/Home/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;