"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { supabase, type FollowUp } from "@/lib/supabase"

export default function TasksPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFollowUps()
  }, [])

  const fetchFollowUps = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("follow_ups")
        .select(`
          *,
          customer:customers(name, email),
          user:users(name)
        `)
        .order("scheduled_date", { ascending: true })

      if (error) throw error
      setFollowUps(data || [])
    } catch (error) {
      console.error("Error fetching follow-ups:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsCompleted = async (followUpId: string) => {
    try {
      const { error } = await supabase
        .from("follow_ups")
        .update({
          status: "done",
          completed_date: new Date().toISOString(),
        })
        .eq("id", followUpId)

      if (error) throw error
      fetchFollowUps()
    } catch (error) {
      console.error("Error marking follow-up as completed:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "done":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "done":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const isOverdue = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date() && scheduledDate
  }

  // Update overdue status
  useEffect(() => {
    const updateOverdueStatus = async () => {
      const overdueFollowUps = followUps.filter(
        (followUp) => followUp.status === "pending" && followUp.scheduled_date && isOverdue(followUp.scheduled_date),
      )

      if (overdueFollowUps.length > 0) {
        const { error } = await supabase
          .from("follow_ups")
          .update({ status: "overdue" })
          .in(
            "id",
            overdueFollowUps.map((f) => f.id),
          )

        if (!error) {
          fetchFollowUps()
        }
      }
    }

    if (followUps.length > 0) {
      updateOverdueStatus()
    }
  }, [followUps])

  const pendingTasks = followUps.filter((f) => f.status === "pending")
  const overdueTasks = followUps.filter((f) => f.status === "overdue")
  const completedTasks = followUps.filter((f) => f.status === "done")

  const TaskTable = ({ tasks, showCompleted = false }: { tasks: FollowUp[]; showCompleted?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          {!showCompleted && <TableHead className="w-12"></TableHead>}
          <TableHead>Customer</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Next Action</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            {!showCompleted && (
              <TableCell>
                <Checkbox checked={false} onCheckedChange={() => markAsCompleted(task.id)} />
              </TableCell>
            )}
            <TableCell className="font-medium">{(task as any).customer?.name}</TableCell>
            <TableCell className="capitalize">{task.type}</TableCell>
            <TableCell className="max-w-xs truncate">{task.next_action || task.notes}</TableCell>
            <TableCell>{task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString() : "-"}</TableCell>
            <TableCell>{(task as any).user?.name || "Unassigned"}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600">Manage your follow-up tasks and deadlines</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length > 0 ? (
                <TaskTable tasks={pendingTasks} />
              ) : (
                <div className="text-center py-8 text-gray-500">No pending tasks</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {overdueTasks.length > 0 ? (
                <TaskTable tasks={overdueTasks} />
              ) : (
                <div className="text-center py-8 text-gray-500">No overdue tasks</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {completedTasks.length > 0 ? (
                <TaskTable tasks={completedTasks} showCompleted={true} />
              ) : (
                <div className="text-center py-8 text-gray-500">No completed tasks</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
