"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Phone, Mail, Calendar, FileText, CheckCircle } from "lucide-react"
import { supabase, type FollowUp, type Customer, type User } from "@/lib/supabase"

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null)
  const [formData, setFormData] = useState({
    customer_id: "",
    user_id: "",
    type: "call" as FollowUp["type"],
    notes: "",
    next_action: "",
    scheduled_date: "",
    status: "pending" as FollowUp["status"],
  })

  useEffect(() => {
    fetchFollowUps()
    fetchCustomers()
    fetchUsers()
  }, [])

  const fetchFollowUps = async () => {
    try {
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
    }
  }

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("*").order("name")

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("name")

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedFollowUp) {
        // Update existing follow-up
        const { error } = await supabase
          .from("follow_ups")
          .update({
            ...formData,
            user_id: formData.user_id || null,
            scheduled_date: formData.scheduled_date || null,
          })
          .eq("id", selectedFollowUp.id)

        if (error) throw error
      } else {
        // Create new follow-up
        const { error } = await supabase.from("follow_ups").insert([
          {
            ...formData,
            user_id: formData.user_id || null,
            scheduled_date: formData.scheduled_date || null,
          },
        ])

        if (error) throw error
      }

      setIsAddDialogOpen(false)
      setSelectedFollowUp(null)
      setFormData({
        customer_id: "",
        user_id: "",
        type: "call",
        notes: "",
        next_action: "",
        scheduled_date: "",
        status: "pending",
      })
      fetchFollowUps()
    } catch (error) {
      console.error("Error saving follow-up:", error)
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

  const openEditDialog = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp)
    setFormData({
      customer_id: followUp.customer_id,
      user_id: followUp.user_id || "",
      type: followUp.type,
      notes: followUp.notes || "",
      next_action: followUp.next_action || "",
      scheduled_date: followUp.scheduled_date ? followUp.scheduled_date.split("T")[0] : "",
      status: followUp.status,
    })
    setIsAddDialogOpen(true)
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-gray-600">Track customer interactions and schedule follow-ups</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedFollowUp(null)
                setFormData({
                  customer_id: "",
                  user_id: "",
                  type: "call",
                  notes: "",
                  next_action: "",
                  scheduled_date: "",
                  status: "pending",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedFollowUp ? "Edit Follow-up" : "Add New Follow-up"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Customer *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="user_id">Assigned To</Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: FollowUp["type"]) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduled_date">Scheduled Date</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="next_action">Next Action</Label>
                <Input
                  id="next_action"
                  value={formData.next_action}
                  onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                  placeholder="What needs to be done next?"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: FollowUp["status"]) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{selectedFollowUp ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Next Action</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followUps.map((followUp) => (
                <TableRow key={followUp.id}>
                  <TableCell className="font-medium">{(followUp as any).customer?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(followUp.type)}
                      <span className="capitalize">{followUp.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{followUp.notes}</TableCell>
                  <TableCell className="max-w-xs truncate">{followUp.next_action}</TableCell>
                  <TableCell>
                    {followUp.scheduled_date ? new Date(followUp.scheduled_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{(followUp as any).user?.name || "Unassigned"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(followUp.status)}>{followUp.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {followUp.status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => markAsCompleted(followUp.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(followUp)}>
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
