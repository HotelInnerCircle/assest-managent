import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  LogOut,
  Download,
  Trash2,
  Eye,
  Loader2,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Session } from "@supabase/supabase-js";

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

const ITEMS_PER_PAGE = 5;

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
      if (!session) navigate("/admin", { replace: true });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/admin", { replace: true });
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
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubmissions((data as Submission[]) || []);
    }

    setLoading(false);
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);

  const paginatedData = submissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= ACTIONS ================= */

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;

    const { error } = await supabase
      .from("submissions")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubmissions((prev) =>
        prev.filter((s) => s.id !== id)
      );
      toast({ title: "Deleted", description: "Submission removed" });
    }
  };

  const handleExport = () => {
    const rows = submissions.map((s) => ({
      "Employee Name": s.employee_name,
      "Employee ID": s.employee_id,
      "Mobile Number": s.employee_number,
      Company: s.company,
      Department: s.department,
      Designation: s.designation,
      Assets: s.selected_assets.join(", "),
      "Submitted At": new Date(s.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Submissions");
    XLSX.writeFile(wb, "asset-submissions.xlsx");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) return null;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Asset Dashboard
          </h1>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSubmissions}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* TABLE */}
      <main className="max-w-7xl mx-auto px-6 pb-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedData.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.employee_name}</TableCell>
                      <TableCell>{s.employee_id}</TableCell>
                      <TableCell>{s.employee_number}</TableCell>
                      <TableCell>{s.company}</TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>
                        {s.selected_assets.join(", ")}
                      </TableCell>
                      <TableCell>
                        {new Date(s.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelected(s)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </main>

      {/* ================= VIEW MODAL ================= */}

      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">

              <div className="border p-4 rounded-lg bg-muted/40">
                <p><b>Name:</b> {selected.employee_name}</p>
                <p><b>Employee ID:</b> {selected.employee_id}</p>
                <p><b>Mobile:</b> {selected.employee_number}</p>
                <p><b>Company:</b> {selected.company}</p>
                <p><b>Department:</b> {selected.department}</p>
                <p><b>Designation:</b> {selected.designation}</p>
              </div>

              {Object.entries(selected.asset_details || {}).map(
                ([type, block]) => (
                  <div key={type} className="border p-4 rounded-lg">
                    <h4 className="font-semibold capitalize mb-2">
                      {type}
                    </h4>

                    {block.brand && <p>Brand: {block.brand}</p>}
                    {block.serialNumber && <p>Serial: {block.serialNumber}</p>}
                    {block.imeiNumber && <p>IMEI: {block.imeiNumber}</p>}
                    {block.simNumber && <p>SIM: {block.simNumber}</p>}
                    {block.description && <p>Description: {block.description}</p>}

                    {block.accessories?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {block.accessories.map((acc) => (
                          <span
                            key={acc}
                            className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                          >
                            {acc}
                          </span>
                        ))}
                      </div>
                    )}

                    {block.images?.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        {block.images.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            className="rounded-lg border h-28 w-full object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminDashboard;
