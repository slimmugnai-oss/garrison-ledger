"use client";

import { useState, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { toast } from "sonner";

interface PCSClaim {
  id: string;
  claim_name: string;
  origin_base: string;
  destination_base: string;
  departure_date: string;
  arrival_date: string;
  status: "draft" | "submitted" | "approved" | "paid" | "rejected" | "archived";
  submitted_date?: string;
  approved_date?: string;
  paid_date?: string;
  total_entitlements?: number;
  total_reimbursed?: number;
  net_savings?: number;
  created_at: string;
  updated_at: string;
}

interface ClaimsStats {
  totalClaims: number;
  totalEntitlements: number;
  totalReimbursed: number;
  totalSavings: number;
  averagePerClaim: number;
  statusBreakdown: Record<string, number>;
}

export default function PCSClaimsLibraryClient() {
  const [claims, setClaims] = useState<PCSClaim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<PCSClaim[]>([]);
  const [stats, setStats] = useState<ClaimsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"timeline" | "grid" | "comparison">("timeline");

  // Load claims data
  useEffect(() => {
    loadClaims();
  }, []);

  // Filter claims based on search and status
  useEffect(() => {
    let filtered = claims;

    if (searchTerm) {
      filtered = filtered.filter(
        (claim) =>
          claim.claim_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.origin_base.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.destination_base.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((claim) => claim.status === statusFilter);
    }

    setFilteredClaims(filtered);
  }, [claims, searchTerm, statusFilter]);

  // Calculate stats
  useEffect(() => {
    if (claims.length > 0) {
      const stats: ClaimsStats = {
        totalClaims: claims.length,
        totalEntitlements: claims.reduce((sum, claim) => sum + (claim.total_entitlements || 0), 0),
        totalReimbursed: claims.reduce((sum, claim) => sum + (claim.total_reimbursed || 0), 0),
        totalSavings: claims.reduce((sum, claim) => sum + (claim.net_savings || 0), 0),
        averagePerClaim: 0,
        statusBreakdown: {},
      };

      stats.averagePerClaim = stats.totalSavings / stats.totalClaims;

      // Calculate status breakdown
      claims.forEach((claim) => {
        stats.statusBreakdown[claim.status] = (stats.statusBreakdown[claim.status] || 0) + 1;
      });

      setStats(stats);
    }
  }, [claims]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pcs/claims/library");

      if (!response.ok) {
        throw new Error("Failed to load claims");
      }

      const data = await response.json();
      setClaims(data.claims || []);
    } catch (error) {
      console.error("Error loading claims:", error);
      toast.error("Failed to load claims. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "submitted":
        return "default";
      case "approved":
        return "success";
      case "paid":
        return "success";
      case "rejected":
        return "destructive";
      case "archived":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return "Edit";
      case "submitted":
        return "Send";
      case "approved":
        return "CheckCircle";
      case "paid":
        return "DollarSign";
      case "rejected":
        return "XCircle";
      case "archived":
        return "Archive";
      default:
        return "File";
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClaimSelect = (claimId: string) => {
    setSelectedClaims((prev) =>
      prev.includes(claimId) ? prev.filter((id) => id !== claimId) : [...prev, claimId]
    );
  };

  const handleExportPDF = async () => {
    if (selectedClaims.length === 0) {
      toast.error("Please select claims to export");
      return;
    }

    try {
      const response = await fetch("/api/pcs/claims/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimIds: selectedClaims }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pcs-claims-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Claims exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export claims");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading claims...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <Icon name="File" className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClaims}</div>
              <p className="text-muted-foreground text-xs">
                {stats.statusBreakdown.paid || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entitlements</CardTitle>
              <Icon name="DollarSign" className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalEntitlements)}</div>
              <p className="text-muted-foreground text-xs">
                {formatCurrency(stats.averagePerClaim)} average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reimbursed</CardTitle>
              <Icon name="CheckCircle" className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalReimbursed)}</div>
              <p className="text-muted-foreground text-xs">
                {((stats.totalReimbursed / stats.totalEntitlements) * 100).toFixed(1)}% of
                entitlements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              <Icon name="TrendingUp" className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSavings)}
              </div>
              <p className="text-muted-foreground text-xs">Lifetime PCS savings</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <Input
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            className="max-w-sm"
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={selectedClaims.length === 0}
          >
            <Icon name="Download" className="mr-2 h-4 w-4" />
            Export PDF ({selectedClaims.length})
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <TimelineView
            claims={filteredClaims}
            onClaimSelect={handleClaimSelect}
            selectedClaims={selectedClaims}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <GridView
            claims={filteredClaims}
            onClaimSelect={handleClaimSelect}
            selectedClaims={selectedClaims}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <ComparisonView
            claims={filteredClaims.filter((claim) => selectedClaims.includes(claim.id))}
            getStatusColor={getStatusColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Timeline View Component
function TimelineView({
  claims,
  onClaimSelect,
  selectedClaims,
  getStatusColor,
  getStatusIcon,
  formatCurrency,
  formatDate,
}: any) {
  const sortedClaims = [...claims].sort(
    (a, b) =>
      new Date(b.departure_date || b.created_at).getTime() -
      new Date(a.departure_date || a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedClaims.length === 0 ? (
        <div className="py-12 text-center">
          <Icon name="File" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No claims found</h3>
          <p className="text-gray-600">Create your first PCS claim to get started.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gray-200"></div>

          {sortedClaims.map((claim, index) => (
            <div key={claim.id} className="relative flex items-start space-x-4 pb-8">
              {/* Timeline dot */}
              <div className="relative flex-shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white ${
                    selectedClaims.includes(claim.id) ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <Icon name={getStatusIcon(claim.status)} className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Claim card */}
              <div
                className={`min-w-0 flex-1 ${
                  selectedClaims.includes(claim.id) ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => onClaimSelect(claim.id)}
                >
                  <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{claim.claim_name}</CardTitle>
                      <Badge variant={getStatusColor(claim.status)}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {claim.origin_base} → {claim.destination_base}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-gray-500">Departure</p>
                        <p className="font-medium">{formatDate(claim.departure_date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Arrival</p>
                        <p className="font-medium">{formatDate(claim.arrival_date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Entitlements</p>
                        <p className="font-medium">{formatCurrency(claim.total_entitlements)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Savings</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(claim.net_savings)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Grid View Component
function GridView({
  claims,
  onClaimSelect,
  selectedClaims,
  getStatusColor,
  getStatusIcon,
  formatCurrency,
  formatDate,
}: any) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {claims.length === 0 ? (
        <div className="col-span-full py-12 text-center">
          <Icon name="File" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No claims found</h3>
          <p className="text-gray-600">Create your first PCS claim to get started.</p>
        </div>
      ) : (
        claims.map((claim: PCSClaim) => (
          <div
            key={claim.id}
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              selectedClaims.includes(claim.id) ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => onClaimSelect(claim.id)}
          >
            <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="truncate text-lg">{claim.claim_name}</CardTitle>
                <Badge variant={getStatusColor(claim.status)}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                {claim.origin_base} → {claim.destination_base}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Departure:</span>
                  <span className="font-medium">{formatDate(claim.departure_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Arrival:</span>
                  <span className="font-medium">{formatDate(claim.arrival_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Entitlements:</span>
                  <span className="font-medium">{formatCurrency(claim.total_entitlements)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Savings:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(claim.net_savings)}
                  </span>
                </div>
              </div>
            </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

// Comparison View Component
function ComparisonView({ claims, getStatusColor, formatCurrency, formatDate }: any) {
  if (claims.length < 2) {
    return (
      <div className="py-12 text-center">
        <Icon name="BarChart" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">Select claims to compare</h3>
        <p className="text-gray-600">
          Choose 2 or more claims from the timeline or grid view to compare them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Comparing {claims.length} Claims</h3>
        <p className="text-gray-600">Side-by-side comparison of your PCS moves</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left font-medium">Claim</th>
              <th className="p-4 text-left font-medium">Route</th>
              <th className="p-4 text-left font-medium">Dates</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-left font-medium">Entitlements</th>
              <th className="p-4 text-left font-medium">Savings</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim: PCSClaim) => (
              <tr key={claim.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{claim.claim_name}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {claim.origin_base} → {claim.destination_base}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <div>{formatDate(claim.departure_date)}</div>
                    <div className="text-gray-500">to {formatDate(claim.arrival_date)}</div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={getStatusColor(claim.status)}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="font-medium">{formatCurrency(claim.total_entitlements)}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-green-600">
                    {formatCurrency(claim.net_savings)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
