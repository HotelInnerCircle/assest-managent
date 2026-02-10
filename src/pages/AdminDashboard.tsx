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
  brand: string;
  serialNumber?: string;
  imeiNumber?: string;
  accessories?: string[];
  images?: string[];
}

interface Submission {
  id: string;
  employee_name: string;
employee_number: number;
  employee_id: string;
  company: string;
  department: string;
  designation: string;
  selected_assets: string[];
  asset_details: {
    laptop?: AssetBlock;
    desktop?: AssetBlock;
    mobile?: AssetBlock;
  };
  confirmed: boolean;
  created_at: string;
}

/* ================= COMPONENT ================= */

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

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

  /* ================= HELPERS ================= */

  const getAllImages = (assetDetails: any): string[] => {
    if (!assetDetails) return [];
    return [
      ...(assetDetails.laptop?.images || []),
      ...(assetDetails.desktop?.images || []),
      ...(assetDetails.mobile?.images || []),
    ];
  };

  /* ================= DATA ================= */

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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;

    const { error } = await supabase.from("submissions").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Deleted", description: "Submission removed" });
    }
  };

  const handleExport = () => {
    const rows = submissions.map((s) => ({
      "Employee Name": s.employee_name,
      // Email: s.employee_email,
      "Employee ID": s.employee_id,
      Company: s.company,
      Department: s.department,
      Designation: s.designation,
      Assets: s.selected_assets.join(", "),
      "Laptop Brand": s.asset_details?.laptop?.brand || "",
      "Laptop Serial": s.asset_details?.laptop?.serialNumber || "",
      "Desktop Brand": s.asset_details?.desktop?.brand || "",
      "Desktop Serial": s.asset_details?.desktop?.serialNumber || "",
      "Mobile Brand": s.asset_details?.mobile?.brand || "",
      "Mobile IMEI": s.asset_details?.mobile?.imeiNumber || "",
      Images: getAllImages(s.asset_details).join(", "),
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
      {/* Header */}
      <header className="border-b bg-card">
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            No submissions found
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.employee_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.employee_number}
                      </p>
                    </TableCell>

                    <TableCell>{s.company}</TableCell>
                    <TableCell>{s.department}</TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.selected_assets.map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      {new Date(s.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
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
        )}
      </main>

      {/* ================= MODAL ================= */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm">
              <p>
                <strong>{selected.employee_name}</strong> (
                {/* {selected.employee_email}) */}
              </p>

              <p>
                <strong>Company:</strong> {selected.company}
              </p>

              <p>
                <strong>Department:</strong> {selected.department}
              </p>

              <p>
                <strong>Designation:</strong> {selected.designation}
              </p>

              <hr />

              {["laptop", "desktop", "mobile"].map((type) => {
                const block = (selected.asset_details as any)?.[type];
                if (!block) return null;

                return (
                  <div key={type}>
                    <p className="font-medium capitalize">{type}</p>
                    <p>Brand: {block.brand}</p>
                    {block.serialNumber && <p>SN: {block.serialNumber}</p>}
                    {block.imeiNumber && <p>IMEI: {block.imeiNumber}</p>}
                    {block.accessories?.length > 0 && (
                      <p>Accessories: {block.accessories.join(", ")}</p>
                    )}
                  </div>
                );
              })}

              {getAllImages(selected.asset_details).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {getAllImages(selected.asset_details).map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt={`Asset ${i + 1}`}
                          className="rounded-lg border h-28 w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
