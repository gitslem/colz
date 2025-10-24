import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, CheckCircle, XCircle, Clock } from "lucide-react";

type OpportunityAnalytics = {
  opportunityId: string;
  title: string;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  acceptanceRate: number;
  createdAt: Date | null;
};

type ApplicationBreakdown = {
  status: string;
  count: number;
};

const COLORS = {
  pending: "hsl(var(--chart-1))",
  accepted: "hsl(var(--chart-2))",
  rejected: "hsl(var(--chart-3))",
};

export default function Analytics() {
  const { data: opportunities, isLoading: isLoadingOpportunities } = useQuery<OpportunityAnalytics[]>({
    queryKey: ["/api/analytics/opportunities"],
  });

  const { data: breakdown, isLoading: isLoadingBreakdown } = useQuery<ApplicationBreakdown[]>({
    queryKey: ["/api/analytics/application-breakdown"],
  });

  const totalApplications = breakdown?.reduce((sum, item) => sum + item.count, 0) || 0;
  const pendingCount = breakdown?.find(b => b.status === 'pending')?.count || 0;
  const acceptedCount = breakdown?.find(b => b.status === 'accepted')?.count || 0;
  const rejectedCount = breakdown?.find(b => b.status === 'rejected')?.count || 0;

  const pieData = breakdown?.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    status: item.status,
  })) || [];

  if (isLoadingOpportunities || isLoadingBreakdown) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your opportunity performance</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-analytics">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-analytics-title">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your opportunity performance</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-applications">{totalApplications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-pending-applications">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-accepted-applications">{acceptedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-rejected-applications">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Performance</CardTitle>
            <CardDescription>Applications per opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={opportunities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="title" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalApplications" fill="hsl(var(--primary))" name="Total Applications" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
            <CardDescription>Distribution of application statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Opportunity Metrics</CardTitle>
          <CardDescription>Complete breakdown of each opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities && opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <div
                  key={opp.opportunityId}
                  className="flex items-center justify-between p-4 rounded-md border"
                  data-testid={`opportunity-stat-${opp.opportunityId}`}
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {opp.totalApplications} total applications
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg">{opp.pendingApplications}</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{opp.acceptedApplications}</div>
                      <div className="text-muted-foreground">Accepted</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{opp.rejectedApplications}</div>
                      <div className="text-muted-foreground">Rejected</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg flex items-center gap-1">
                        {opp.acceptanceRate}%
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="text-muted-foreground">Rate</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No opportunities found. Create your first opportunity to see analytics.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
