import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const monthly = [
  { month: "Jan", complaints: 8 },
  { month: "Feb", complaints: 12 },
  { month: "Mar", complaints: 15 },
  { month: "Apr", complaints: 10 },
  { month: "May", complaints: 18 },
  { month: "Jun", complaints: 7 },
];

const resolution = [
  { month: "Jan", days: 5 },
  { month: "Feb", days: 4.2 },
  { month: "Mar", days: 3.8 },
  { month: "Apr", days: 3.5 },
  { month: "May", days: 3.2 },
  { month: "Jun", days: 2.8 },
];

export default function AdminReports() {
  return (
    <DashboardLayout role="admin" title="Reports & Analytics">
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="font-display text-base">Monthly Complaints</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="complaints" fill="hsl(162 63% 30%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="font-display text-base">Avg. Resolution Time (Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={resolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="days" stroke="hsl(199 89% 48%)" strokeWidth={2} dot={{ fill: "hsl(199 89% 48%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}