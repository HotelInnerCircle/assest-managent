import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { IoDesktop } from "react-icons/io5";
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
import { FaSimCard } from "react-icons/fa";

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
      desktops: 0,
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
        } else if (name.includes('desktop')) {
          result.desktops++;
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
    const rows = submissions.map((s, index) => ({
      'S.No': index + 1,
      Name: s.employee_name,
      ID: s.employee_id,
      Mobile: s.employee_number,
      Department: s.department,
      Assets: (s.selected_assets || []).join(', '),
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
            icon={<Package />}
            variant='primary'
          />
          <StatCard
            title='Phones'
            value={stats.phones}
            icon={<Smartphone />}
            variant='blue'
          />
          <StatCard
            title='Laptops'
            value={stats.laptops}
            icon={<Laptop />}
            variant='green'
          />
          <StatCard
            title='Desktops'
            value={stats.desktops}
            icon={<IoDesktop />}
            variant='green'
          />
          <StatCard
            title='Tablets'
            value={stats.tablets}
            icon={<Tablet />}
            variant='orange'
          />
          <StatCard
            title='Sims'
            value={stats.sims}
            icon={<FaSimCard />}
            variant='pink'
          />
          <StatCard
            title='Others'
            value={stats.others}
            icon={<Package />}
            variant='purple'
          />
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
                  <TableHead>S.No</TableHead>
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
                {paginatedData.map((s,index) => (
                  <TableRow key={s.id} className='hover:bg-gray-50 transition'>
                    <TableCell>
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </TableCell>
                    <TableCell>{s.employee_name}</TableCell>
                    <TableCell>{s.employee_id}</TableCell>
                    <TableCell>{s.employee_number}</TableCell>

                    <TableCell>{s.company}</TableCell>
                    <TableCell>{s.department}</TableCell>
                   <TableCell>
                      {(s.selected_assets || []).join(", ") || "-"}
                    </TableCell>
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

                      {/* <Button
                        variant='ghost'
                        size='icon'
                        className='text-destructive'
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button> */}
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
  <DialogContent className="max-w-5xl rounded-3xl p-0 overflow-hidden">
    {selected && (
      <div className="flex flex-col max-h-[85vh]">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-semibold">
            {selected.employee_name}
          </h2>
          <p className="text-sm opacity-80">
            Submission Details • {new Date(selected.created_at).toLocaleString()}
          </p>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto p-6 space-y-6 bg-gray-50">

          {/* EMPLOYEE INFO CARD */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <InfoItem label="Employee ID" value={selected.employee_id} />
            <InfoItem label="Mobile" value={selected.employee_number} />
            <InfoItem label="Department" value={selected.department} />
            <InfoItem label="Company" value={selected.company} />
            <InfoItem label="Designation" value={selected.designation} />
          </div>

          {/* ASSET DETAILS */}
          {Object.entries(selected.asset_details || {}).map(
            ([type, block]) => (
              <div
                key={type}
                className="bg-white rounded-2xl shadow-sm border p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold capitalize text-indigo-600 border-b pb-2">
                  {type}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                  {block.brand && (
                    <InfoItem label="Brand" value={block.brand} />
                  )}

                  {block.serialNumber && (
                    <InfoItem label="Serial Number" value={block.serialNumber} />
                  )}

                  {block.imeiNumber && (
                    <InfoItem label="IMEI" value={block.imeiNumber} />
                  )}

                  {block.simNumber && (
                    <InfoItem label="SIM Number" value={block.simNumber} />
                  )}

                  {block.description && (
                    <div className="col-span-full">
                      <p className="text-gray-500 text-xs mb-1">Description</p>
                      <p className="bg-gray-100 p-3 rounded-lg text-sm">
                        {block.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* ACCESSORIES */}
                {block.accessories?.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs mb-2">Accessories</p>
                    <div className="flex flex-wrap gap-2">
                      {block.accessories.map((acc) => (
                        <span
                          key={acc}
                          className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600 font-medium"
                        >
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* IMAGES */}
                {block.images?.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs mb-3">Images</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {block.images.map((url, i) => (
                        <ImageCard key={i} src={url} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
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
  const [count, setCount] = useState(0);

  // Smooth counter animation
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = value / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(counter);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value]);

  const variants = {
    primary:
      "from-indigo-500/20 to-purple-600/20 border-indigo-500/30",
    blue:
      "from-blue-500/20 to-cyan-600/20 border-blue-500/30",
    green:
      "from-emerald-500/20 to-green-600/20 border-emerald-500/30",
    orange:
      "from-orange-500/20 to-amber-600/20 border-orange-500/30",
    pink:
      "from-pink-500/20 to-rose-600/20 border-pink-500/30",
    purple:
      "from-violet-500/20 to-fuchsia-600/20 border-violet-500/30",
  };

  return (
    <div
      className={`
        group relative
        rounded-3xl p-[1px]
        bg-gradient-to-br ${variants[variant]}
        transition-all duration-300
        hover:scale-[1.03]
      `}
    >
      <div
        className="
          relative rounded-3xl p-6
          bg-white/70 dark:bg-gray-900/70
          backdrop-blur-xl
          border border-white/20 dark:border-gray-700
          shadow-lg
          overflow-hidden
        "
      >
        {/* Soft glow background */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition"></div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {title}
            </p>

            <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
              {count}
            </h2>
          </div>

          <div
            className="
              flex items-center justify-center
              w-14 h-14
              rounded-2xl
              bg-gradient-to-br from-red-500 to-blue-600
              text-white
              shadow-md
              group-hover:rotate-6
              transition-transform duration-300
            "
          >
            {icon}
          </div>
        </div>

        {/* Bottom subtle progress bar animation */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-b-3xl">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"
            style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};


export default AdminDashboard;


const ImageCard = ({ src }: { src: string }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative group rounded-xl overflow-hidden border bg-gray-100 aspect-square">

      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      <img
        src={src}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition duration-300 
        ${loaded ? "opacity-100" : "opacity-0"}
        group-hover:scale-105`}
        alt="asset"
      />
    </div>
  );
};


const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    <p className="font-medium text-gray-800">{value || "-"}</p>
  </div>
);
