"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Database } from "lucide-react"
import { seedDatabase, checkDatabaseStatus } from "@/lib/database-setup"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [dbStatus, setDbStatus] = useState<{ exists: boolean; count?: number; error?: string } | null>(null)
  const [setupStatus, setSetupStatus] = useState<string>("")
  const [setupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    const status = await checkDatabaseStatus()
    setDbStatus(status)
    if (status.exists && status.count !== undefined && status.count > 0) {
      setSetupComplete(true)
      setSetupStatus("Database is already set up and populated with data!")
    }
  }

  const handleSetupDatabase = async () => {
    setIsLoading(true)
    setSetupStatus("Creating database tables...")

    try {
      // For now, we'll provide manual SQL instructions since RPC might not be available
      setSetupStatus("Please run the SQL scripts manually in your Supabase SQL editor")
      setIsLoading(false)
    } catch (error) {
      console.error("Setup error:", error)
      setSetupStatus("Setup failed. Please check the console for details.")
      setIsLoading(false)
    }
  }

  const handleSeedData = async () => {
    setIsLoading(true)
    setSetupStatus("Adding sample data...")

    const result = await seedDatabase()

    if (result.success) {
      setSetupStatus("Sample data added successfully!")
      setSetupComplete(true)
      await checkStatus()
    } else {
      setSetupStatus(`Failed to add sample data: ${result.error}`)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">AutoCRM Database Setup</h1>
          <p className="text-gray-600 mt-2">Initialize your CRM database with tables and sample data</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            {dbStatus === null ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking database status...</span>
              </div>
            ) : dbStatus.exists ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Database tables exist ({dbStatus.count} users found)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Database tables not found</span>
              </div>
            )}
          </CardContent>
        </Card>

        {!setupComplete && (
          <Card>
            <CardHeader>
              <CardTitle>Manual Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please run the following SQL scripts in your Supabase SQL editor (in order):
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Create Tables Script:</h3>
                  <div className="bg-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto">
                    <pre>{`-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'salesperson',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    city VARCHAR(100),
    lead_status VARCHAR(50) DEFAULT 'New',
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follow_ups table
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    notes TEXT,
    next_action TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_vehicle_interests table
CREATE TABLE IF NOT EXISTS customer_vehicle_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    interest_level VARCHAR(50) DEFAULT 'interested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}</pre>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={checkStatus} variant="outline">
                    Check Status Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {dbStatus?.exists && !setupComplete && (
          <Card>
            <CardHeader>
              <CardTitle>Add Sample Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Add sample users, customers, vehicles, and follow-ups to get started quickly.
              </p>
              <Button onClick={handleSeedData} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Sample Data
              </Button>
            </CardContent>
          </Card>
        )}

        {setupComplete && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Setup Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Your database is ready. You can now use all features of the CRM.</p>
              <Button asChild>
                <a href="/">Go to Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {setupStatus && (
          <Alert>
            <AlertDescription>{setupStatus}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
