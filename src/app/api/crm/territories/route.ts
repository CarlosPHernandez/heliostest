import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Schema for territory data validation
const territorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

// GET handler to fetch all territories
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

    // Fetch all territories
    const { data: territories, error } = await supabase
      .from('SalesTerritory')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching territories:', error);
      return NextResponse.json({ error: 'Failed to fetch territories' }, { status: 500 });
    }

    return NextResponse.json({ territories });
  } catch (error) {
    console.error('Error in territories GET handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler to create a new territory
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

    // Only admin can create territories
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = territorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    // Generate a unique ID for the territory
    const id = `territory-${validationResult.data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Create the territory
    const { data: newTerritory, error } = await supabase
      .from('SalesTerritory')
      .insert({
        id,
        name: validationResult.data.name,
        description: validationResult.data.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating territory:', error);
      return NextResponse.json({ error: 'Failed to create territory' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Territory created successfully',
      territory: newTerritory
    }, { status: 201 });
  } catch (error) {
    console.error('Error in territories POST handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH handler to update a territory
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

    // Only admin can update territories
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Territory ID is required' }, { status: 400 });
    }

    // Validate update data
    const validationResult = territorySchema.partial().safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    // Update territory
    const { data: updatedTerritory, error } = await supabase
      .from('SalesTerritory')
      .update(validationResult.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating territory:', error);
      return NextResponse.json({ error: 'Failed to update territory' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Territory updated successfully',
      territory: updatedTerritory
    });
  } catch (error) {
    console.error('Error in territories PATCH handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler to remove a territory
export async function DELETE(req: NextRequest) {
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

    // Only admin can delete territories
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get territory ID from URL
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Territory ID is required' }, { status: 400 });
    }

    // Check if territory is assigned to any leads
    const { data: leadCount, error: leadError } = await supabase
      .from('Lead')
      .select('id', { count: 'exact' })
      .eq('territoryId', id);

    if (leadError) {
      console.error('Error checking leads:', leadError);
      return NextResponse.json({ error: 'Failed to check territory usage' }, { status: 500 });
    }

    if (leadCount && leadCount.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete territory that has leads assigned to it',
        count: leadCount.length
      }, { status: 400 });
    }

    // Delete territory assignments first
    const { error: assignmentError } = await supabase
      .from('UserTerritory')
      .delete()
      .eq('territoryId', id);

    if (assignmentError) {
      console.error('Error deleting territory assignments:', assignmentError);
      return NextResponse.json({ error: 'Failed to delete territory assignments' }, { status: 500 });
    }

    // Delete the territory
    const { error: deleteError } = await supabase
      .from('SalesTerritory')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting territory:', deleteError);
      return NextResponse.json({ error: 'Failed to delete territory' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Territory deleted successfully'
    });
  } catch (error) {
    console.error('Error in territories DELETE handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 