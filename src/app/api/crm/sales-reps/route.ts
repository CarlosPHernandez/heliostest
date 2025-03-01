import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Schema for sales rep data validation
const salesRepSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  sales_title: z.string().optional(),
  sales_phone: z.string().optional(),
  sales_bio: z.string().optional(),
  sales_photo_url: z.string().url().optional(),
  sales_target: z.number().optional(),
  sales_hire_date: z.string().optional(),
  territories: z.array(z.string()).optional(),
});

// GET handler to fetch all sales reps
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Only admin and sales_rep can access this endpoint
    if (userData?.role !== 'admin' && userData?.role !== 'sales_rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const territoryId = url.searchParams.get('territoryId');

    // Base query to get sales reps
    let query = supabase
      .from('User')
      .select(`
        id, 
        name, 
        email, 
        role, 
        sales_title, 
        sales_phone, 
        sales_bio, 
        sales_photo_url, 
        sales_target, 
        sales_hire_date,
        UserTerritory(territoryId, isPrimary)
      `)
      .eq('role', 'sales_rep');

    // Filter by territory if provided
    if (territoryId) {
      query = query.eq('UserTerritory.territoryId', territoryId);
    }

    const { data: salesReps, error } = await query;

    if (error) {
      console.error('Error fetching sales reps:', error);
      return NextResponse.json({ error: 'Failed to fetch sales reps' }, { status: 500 });
    }

    return NextResponse.json({ salesReps });
  } catch (error) {
    console.error('Error in sales reps GET handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler to create a new sales rep
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Only admin can create sales reps
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = salesRepSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    const { territories, ...salesRepData } = validationResult.data;

    // Create the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: salesRepData.email,
      password: Math.random().toString(36).slice(-8), // Generate random password
      email_confirm: true,
      user_metadata: { role: 'sales_rep' }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create the user in the database
    const { data: newUser, error: userError } = await supabase
      .from('User')
      .insert({
        id: authData.user.id,
        name: salesRepData.name,
        email: salesRepData.email,
        role: 'sales_rep',
        sales_title: salesRepData.sales_title,
        sales_phone: salesRepData.sales_phone,
        sales_bio: salesRepData.sales_bio,
        sales_photo_url: salesRepData.sales_photo_url,
        sales_target: salesRepData.sales_target,
        sales_hire_date: salesRepData.sales_hire_date,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user record:', userError);
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
    }

    // Assign territories if provided
    if (territories && territories.length > 0) {
      const territoryAssignments = territories.map((territoryId, index) => ({
        userId: authData.user.id,
        territoryId,
        isPrimary: index === 0 // First territory is primary
      }));

      const { error: territoryError } = await supabase
        .from('UserTerritory')
        .insert(territoryAssignments);

      if (territoryError) {
        console.error('Error assigning territories:', territoryError);
        // Continue anyway, as the user was created successfully
      }
    }

    // Create default CRM permissions
    const { error: permissionError } = await supabase
      .from('CrmPermission')
      .insert({
        userId: authData.user.id,
        canViewLeads: true,
        canCreateLeads: true,
        canEditLeads: true,
        canDeleteLeads: false,
        canAssignLeads: false,
      });

    if (permissionError) {
      console.error('Error creating CRM permissions:', permissionError);
      // Continue anyway, as the user was created successfully
    }

    return NextResponse.json({
      message: 'Sales rep created successfully',
      user: newUser
    }, { status: 201 });
  } catch (error) {
    console.error('Error in sales reps POST handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH handler to update a sales rep
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Only admin can update other sales reps
    const isAdmin = userData?.role === 'admin';

    // Parse request body
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Sales reps can only update their own profile
    if (!isAdmin && id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate update data
    const validationResult = salesRepSchema.partial().safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    const { territories, ...salesRepData } = validationResult.data;

    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('User')
      .update(salesRepData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    // Update territories if provided
    if (territories && territories.length > 0) {
      // First delete existing territory assignments
      const { error: deleteError } = await supabase
        .from('UserTerritory')
        .delete()
        .eq('userId', id);

      if (deleteError) {
        console.error('Error deleting territories:', deleteError);
        // Continue anyway
      }

      // Then insert new territory assignments
      const territoryAssignments = territories.map((territoryId, index) => ({
        userId: id,
        territoryId,
        isPrimary: index === 0 // First territory is primary
      }));

      const { error: insertError } = await supabase
        .from('UserTerritory')
        .insert(territoryAssignments);

      if (insertError) {
        console.error('Error assigning territories:', insertError);
        // Continue anyway
      }
    }

    return NextResponse.json({
      message: 'Sales rep updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in sales reps PATCH handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 