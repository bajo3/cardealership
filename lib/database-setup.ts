import { supabase } from "./supabase"

export const setupDatabase = async () => {
  try {
    // Create tables
    const createTablesSQL = `
      -- Create users table for salespeople
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

      -- Create customer_vehicle_interests table (many-to-many)
      CREATE TABLE IF NOT EXISTS customer_vehicle_interests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
          vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
          interest_level VARCHAR(50) DEFAULT 'interested',
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

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_customers_lead_status ON customers(lead_status);
      CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON customers(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_follow_ups_customer_id ON follow_ups(customer_id);
      CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_date ON follow_ups(scheduled_date);
      CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);
    `

    const { error: createError } = await supabase.rpc("exec_sql", { sql: createTablesSQL })
    if (createError) {
      console.error("Error creating tables:", createError)
      throw createError
    }

    return { success: true, message: "Database setup completed successfully" }
  } catch (error) {
    console.error("Database setup error:", error)
    return { success: false, error: error.message }
  }
}

export const seedDatabase = async () => {
  try {
    // Insert sample users
    const { error: usersError } = await supabase.from("users").upsert(
      [
        { email: "john.doe@dealership.com", name: "John Doe", role: "salesperson" },
        { email: "jane.smith@dealership.com", name: "Jane Smith", role: "salesperson" },
        { email: "admin@dealership.com", name: "Admin User", role: "admin" },
      ],
      { onConflict: "email" },
    )

    if (usersError) throw usersError

    // Insert sample vehicles
    const { error: vehiclesError } = await supabase.from("vehicles").upsert([
      { make: "Toyota", model: "Camry", year: 2024, price: 28500.0 },
      { make: "Honda", model: "Civic", year: 2024, price: 24500.0 },
      { make: "Ford", model: "F-150", year: 2024, price: 35000.0 },
      { make: "BMW", model: "3 Series", year: 2024, price: 42000.0 },
      { make: "Mercedes-Benz", model: "C-Class", year: 2024, price: 45000.0 },
      { make: "Audi", model: "A4", year: 2024, price: 40000.0 },
      { make: "Chevrolet", model: "Silverado", year: 2024, price: 33000.0 },
      { make: "Nissan", model: "Altima", year: 2024, price: 26000.0 },
      { make: "Hyundai", model: "Elantra", year: 2024, price: 22000.0 },
      { make: "Volkswagen", model: "Jetta", year: 2024, price: 25000.0 },
    ])

    if (vehiclesError) throw vehiclesError

    // Get user IDs for customer assignment
    const { data: users } = await supabase.from("users").select("id, email")
    const johnId = users?.find((u) => u.email === "john.doe@dealership.com")?.id
    const janeId = users?.find((u) => u.email === "jane.smith@dealership.com")?.id

    // Insert sample customers
    const { error: customersError } = await supabase.from("customers").upsert([
      {
        name: "Alice Johnson",
        phone: "+1-555-0101",
        email: "alice.johnson@email.com",
        city: "New York",
        lead_status: "New",
        assigned_to: johnId,
      },
      {
        name: "Bob Wilson",
        phone: "+1-555-0102",
        email: "bob.wilson@email.com",
        city: "Los Angeles",
        lead_status: "In Follow-up",
        assigned_to: janeId,
      },
      {
        name: "Carol Davis",
        phone: "+1-555-0103",
        email: "carol.davis@email.com",
        city: "Chicago",
        lead_status: "Quoted",
        assigned_to: johnId,
      },
      {
        name: "David Brown",
        phone: "+1-555-0104",
        email: "david.brown@email.com",
        city: "Houston",
        lead_status: "New",
        assigned_to: janeId,
      },
      {
        name: "Eva Martinez",
        phone: "+1-555-0105",
        email: "eva.martinez@email.com",
        city: "Phoenix",
        lead_status: "Closed",
        assigned_to: johnId,
      },
    ])

    if (customersError) throw customersError

    return { success: true, message: "Sample data added successfully" }
  } catch (error) {
    console.error("Seed data error:", error)
    return { success: false, error: error.message }
  }
}

export const checkDatabaseStatus = async () => {
  try {
    const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true })
    if (error) {
      return { exists: false, error: error.message }
    }
    return { exists: true, count }
  } catch (error) {
    return { exists: false, error: error.message }
  }
}
