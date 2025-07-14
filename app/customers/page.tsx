"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Eye } from "lucide-react"
import { supabase, type Customer, type User } from "@/lib/supabase"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    lead_status: "New" as Customer["lead_status"],
    assigned_to: "",
  })

  useEffect(() => {
    fetchCustomers()
    fetchUsers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

      if (error) {
        // If table doesn't exist, redirect to setup
        if (error.message.includes('relation "public.customers" does not exist')) {
          window.location.href = "/setup"
          return
        }
        throw error
      }
      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
      // Check if it's a table not found error
      if (error.message?.includes("does not exist")) {
        window.location.href = "/setup"
      }
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("name")

      if (error) {
        // If table doesn't exist, redirect to setup
        if (error.message.includes('relation "public.users" does not exist')) {
          window.location.href = "/setup"
          return
        }
        throw error
      }
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      // Check if it's a table not found error
      if (error.message?.includes("does not exist")) {
        window.location.href = "/setup"
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from("customers")
          .update({
            ...formData,
            assigned_to: formData.assigned_to ? formData.assigned_to : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedCustomer.id)

        if (error) throw error
      } else {
        // Create new customer
        const { error } = await supabase.from("customers").insert([
          {
            ...formData,
            assigned_to: formData.assigned_to ? formData.assigned_to : null,
          },
        ])

        if (error) throw error
      }

      setIsAddDialogOpen(false)
      setSelectedCustomer(null)
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        lead_status: "New",
        assigned_to: "",
      })
      fetchCustomers()
    } catch (error) {
      console.error("Error saving customer:", error)
    }
  }

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      city: customer.city || "",
      lead_status: customer.lead_status,
      assigned_to: customer.assigned_to ?? "",
    })
    setIsAddDialogOpen(true)
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  )

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedCustomer(null)
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  city: "",
                  lead_status: "New",
                  assigned_to: "",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="lead_status">Lead Status</Label>
                <Select
                  value={formData.lead_status}
                  onValueChange={(value: Customer["lead_status"]) => setFormData({ ...formData, lead_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Follow-up">In Follow-up</SelectItem>
                    <SelectItem value="Quoted">Quoted</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Not Interested">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select salesperson" />
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

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{selectedCustomer ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const assignedUser =
                  users.length > 0 ? users.find((u) => u.id === customer.assigned_to)?.name : undefined

                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div>
                        {customer.email && <div>{customer.email}</div>}
                        {customer.phone && <div className="text-sm text-gray-600">{customer.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.lead_status)}>{customer.lead_status}</Badge>
                    </TableCell>
                    <TableCell>{assignedUser || "Unassigned"}</TableCell>
                    <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
