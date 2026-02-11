import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  LogOut,
  Download,
  Trash2,
  Eye,
  Loader2,
  ClipboardList,
  RefreshCw,
  Smartphone,
  Laptop,
  Tablet,
  Package,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Session } from '@supabase/supabase-js';

/* ================= TYPES ================= */

interface AssetBlock {
  brand?: string;
  serialNumber?: string;
  imeiNumber?: string;
  simNumber?: string;
  description?: string;
  accessories?: string[];
  images?: string[];
}

interface Submission {
  id: string;
  employee_name: string;
  employee_number: string;
  employee_id: string;
  company: string;
  department: string;
  designation: string;
  selected_assets: string[];
  asset_details: Record<string, AssetBlock>;
  confirmed: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= AUTH ================= */

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (!session) navigate('/admin', { replace: true });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate('/admin', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) fetchSubmissions();
  }, [session]);

  /* ================= FETCH ================= */

  const fetchSubmissions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSubmissions((data as Submission[]) || []);
    }

    setLoading(false);
  };

  /* ================= STATS ================= */

const stats = useMemo(() => {
  const result = {
    phones: 0,
    laptops: 0,
    tablets: 0,
    sims: 0,
    others: 0,
  };

  submissions.forEach((s) => {
    s.selected_assets.forEach((asset) => {
      const name = asset.toLowerCase();

      if (name.includes('phone') || name.includes('mobile')) {
        result.phones++;
      } else if (name.includes('laptop')) {
        result.laptops++;
      } else if (name.includes('tablet') || name.includes('tab')) {
        result.tablets++;
      } else if (name.includes('sim')) {
        result.sims++;
      } else {
        result.others++;
      }
    });
  });

  return result;
}, [submissions]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);

  const paginatedData = submissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  /* ================= ACTIONS ================= */

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return;

    const { error } = await supabase.from('submissions').delete().eq('id', id);

    if (!error) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast({ title: 'Deleted successfully' });
    }
  };

  const handleExport = () => {
    const rows = submissions.map((s) => ({
      Name: s.employee_name,
      ID: s.employee_id,
      Mobile: s.employee_number,
      Department: s.department,
      Assets: s.selected_assets.join(', '),
      Date: new Date(s.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
    XLSX.writeFile(wb, 'asset-submissions.xlsx');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) return null;

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* HEADER */}
      <header className='bg-white border-b shadow-sm sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <ClipboardList className='w-6 h-6 text-primary' />
            Asset Dashboard
          </h1>

          <div className='flex gap-2'>
            <Button size='sm' variant='outline' onClick={fetchSubmissions}>
              <RefreshCw className='w-4 h-4 mr-1' />
              Refresh
            </Button>

            <Button size='sm' onClick={handleExport}>
              <Download className='w-4 h-4 mr-1' />
              Export
            </Button>

            <Button size='sm' variant='destructive' onClick={handleLogout}>
              <LogOut className='w-4 h-4 mr-1' />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* STATS CARDS */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
          <StatCard
            title='Total Submissions'
            value={submissions.length}
            icon={<Package />} variant="primary" 
          />
          <StatCard title='Phones' value={stats.phones} icon={<Smartphone />}  variant="blue"/>
          <StatCard title='Laptops' value={stats.laptops} icon={<Laptop />}   variant="green" />
          <StatCard title='Tablets' value={stats.tablets} icon={<Tablet />}  variant="orange"/>
           <StatCard title='Sims' value={stats.sims} icon={<Package />}  variant="pink"/>
          <StatCard title='Others' value={stats.others} icon={<Package />}  variant="purple"/>

        </div>

        {/* TABLE */}
        <div className='bg-white rounded-xl shadow-sm border overflow-hidden'>
          {loading ? (
            <div className='flex justify-center py-20'>
              <Loader2 className='animate-spin text-primary' />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Mobile</TableHead>
                 <TableHead>Company</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.map((s) => (
                  <TableRow key={s.id} className='hover:bg-gray-50 transition'>
                    <TableCell>{s.employee_name}</TableCell>
                    <TableCell>{s.employee_id}</TableCell>
                    <TableCell>{s.employee_number}</TableCell>

                    <TableCell>{s.company}</TableCell>
                    <TableCell>{s.department}</TableCell>
                    <TableCell>{s.selected_assets.join(', ')}</TableCell>
                    <TableCell>
                      {new Date(s.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className='text-right space-x-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setSelected(s)}
                      >
                        <Eye className='w-4 h-4' />
                      </Button>

                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-destructive'
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* PAGINATION */}
        <div className='flex justify-between items-center mt-6'>
          <span className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </span>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              variant='outline'
              size='sm'
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      {/* MODAL */}
      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent className='max-w-4xl rounded-2xl'>
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className='space-y-4'>
              <div className='bg-gray-50 p-4 rounded-lg border'>
                <p>
                  <b>Name:</b> {selected.employee_name}
                </p>
                <p>
                  <b>ID:</b> {selected.employee_id}
                </p>
                <p>
                  <b>Mobile:</b> {selected.employee_number}
                </p>
                <p>
                  <b>Department:</b> {selected.department}
                </p>
                <p>
                  <b>Company:</b> {selected.company}
                </p>
                <p>
                  <b>Designation:</b> {selected.designation}
                </p>
                {Object.entries(selected.asset_details || {}).map(
                  ([type, block]) => (
                    <div key={type} className='border p-4 rounded-lg'>
                      <h4 className='font-semibold capitalize mb-2'>{type}</h4>

                      {block.brand && <p>Brand: {block.brand}</p>}
                      {block.serialNumber && (
                        <p>Serial: {block.serialNumber}</p>
                      )}
                      {block.imeiNumber && <p>IMEI: {block.imeiNumber}</p>}
                      {block.simNumber && <p>SIM: {block.simNumber}</p>}
                      {block.description && (
                        <p>Description: {block.description}</p>
                      )}

                      {block.accessories?.length > 0 && (
                        <div className='flex flex-wrap gap-2 mt-2'>
                          {block.accessories.map((acc) => (
                            <span
                              key={acc}
                              className='px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary'
                            >
                              {acc}
                            </span>
                          ))}
                        </div>
                      )}

                      {block.images?.length > 0 && (
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3'>
                          {block.images.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              className='rounded-lg border h-28 w-full object-cover'
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({
  title,
  value,
  icon,
  variant = "primary",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "primary" | "blue" | "green" | "orange" | "pink" | "purple";
}) => {

  const variants = {
    primary:
      "bg-gradient-to-br from-indigo-500 to-purple-600",
    blue:
      "bg-gradient-to-br from-blue-500 to-cyan-600",
    green:
      "bg-gradient-to-br from-emerald-500 to-green-600",
    orange:
      "bg-gradient-to-br from-orange-500 to-amber-600",
    pink:
      "bg-gradient-to-br from-pink-500 to-rose-600",
    purple:
      "bg-gradient-to-br from-red-400 to-blue-700",
  };

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-2xl p-6
        ${variants[variant]}
        text-white
        shadow-lg
        hover:shadow-2xl
        transform hover:-translate-y-1
        transition-all duration-300
      `}
    >
      {/* Glow bubble */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>

      <div className="flex justify-between items-center relative z-10">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <h2 className="text-3xl font-bold mt-1 tracking-tight">
            {value}
          </h2>
        </div>

        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
};



export default AdminDashboard;
