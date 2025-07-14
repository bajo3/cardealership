"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Phone, Calendar, TrendingUp, Car, CheckCircle } from "lucide-react"
import { supabase, type Customer, type FollowUp } from "@/lib/supabase"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newLeads: 0,
    pendingFollowUps: 0,
    closedDeals: 0,
    totalVehicles: 0,
    overdueFollowUps: 0,
  })
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<FollowUp[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Check if tables exist by trying to fetch from users table first
      const { error: testError } = await supabase.from("users").select("*", { count: "exact", head: true }).limit(1)

      if (testError) {
        if (testError.message.includes("does not exist")) {
          window.location.href = "/setup"
          return
        }
        throw testError
      }

      // If we get here, tables exist, proceed with normal fetching
      const [
        { count: totalCustomers },
        { count: newLeads },
        { count: pendingFollowUps },
        { count: closedDeals },
        { count: totalVehicles },
        { count: overdueFollowUps },
      ] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("lead_status", "New"),
        supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("lead_status", "Closed"),
        supabase.from("vehicles").select("*", { count: "exact", head: true }),
        supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("status", "overdue"),
      ])

      setStats({
        totalCustomers: totalCustomers || 0,
        newLeads: newLeads || 0,
        pendingFollowUps: pendingFollowUps || 0,
        closedDeals: closedDeals || 0,
        totalVehicles: totalVehicles || 0,
        overdueFollowUps: overdueFollowUps || 0,
      })

      // Fetch recent customers
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      setRecentCustomers(customers || [])

      // Fetch upcoming follow-ups
      const { data: followUps } = await supabase
        .from("follow_ups")
        .select(`
          *,
          user:users(name),
          customer:customers(name)
        `)
        .eq("status", "pending")
        .order("scheduled_date", { ascending: true })
        .limit(5)

      setUpcomingFollowUps(followUps || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      if (error.message?.includes("does not exist")) {
        window.location.href = "/setup"
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "In Follow-up":
        return "bg-yellow-100 text-yellow-800"
      case "Quoted":
        return "bg-purple-100 text-purple-800"
      case "Closed":
        return "bg-green-100 text-green-800"
      case "Not Interested":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your dealership.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFollowUps}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closedDeals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueFollowUps}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                  <Badge className={getStatusColor(customer.lead_status)}>{customer.lead_status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingFollowUps.map((followUp) => (
                <div key={followUp.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{(followUp as any).customer?.name}</p>
                    <p className="text-sm text-gray-600">
                      {followUp.type} - {followUp.next_action}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {followUp.scheduled_date ? new Date(followUp.scheduled_date).toLocaleDateString() : "No date"}
                    </p>
                    <p className="text-xs text-gray-600">{(followUp as any).user?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
