import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] pt-16 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout; 