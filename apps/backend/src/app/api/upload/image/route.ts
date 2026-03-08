/**
 * ============================================================
 * Image Upload API - อัปโหลดรูปภาพ
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'

/**
 * POST /api/upload/image - อัปโหลดรูปภาพ
 */
export async function POST(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const item_type = formData.get('item_type') as string
    const item_id = formData.get('item_id') as string
    const folder = formData.get('folder') as string || 'general'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!item_type || !item_id) {
      return NextResponse.json({ error: 'Missing item_type or item_id' }, { status: 400 })
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Mock mode
    if (isMockMode()) {
      // Generate mock URL
      const mockUrl = `https://storage.example.com/${folder}/${item_type}/${item_id}/${Date.now()}_${file.name}`
      
      console.log('[Mock Upload]', {
        fileName: file.name,
        fileSize: file.size,
        item_type,
        item_id,
        folder
      })
      
      return NextResponse.json({
        success: true,
        url: mockUrl,
        path: `/${folder}/${item_type}/${item_id}/${Date.now()}_${file.name}`,
        fileName: file.name,
        fileSize: file.size
      }, { status: 201 })
    }
    
    // Real Supabase Storage
    const supabase = await createAdminClient()
    const fileName = `${item_type}/${item_id}/${Date.now()}_${file.name}`
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)
    
    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: fileName,
      fileName: file.name,
      fileSize: file.size
    }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/upload/image - ลบรูปภาพ
 */
export async function DELETE(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  const { searchParams } = new URL(request.url)
  const image_url = searchParams.get('url')
  const path = searchParams.get('path')
  
  if (!image_url && !path) {
    return NextResponse.json({ error: 'Missing url or path' }, { status: 400 })
  }
  
  // Mock mode
  if (isMockMode()) {
    console.log('[Mock Delete]', { image_url, path })
    return NextResponse.json({ success: true, message: 'Image deleted (mock)' })
  }
  
  // Real Supabase Storage
  try {
    const supabase = await createAdminClient()
    
    // Extract path from URL if full URL provided
    let filePath = path || ''
    if (!filePath && image_url) {
      // Extract path from Supabase URL
      const urlParts = image_url.split('/storage/v1/object/public/images/')
      if (urlParts.length > 1) {
        filePath = urlParts[1]
      }
    }
    
    if (!filePath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
    
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, message: 'Image deleted' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
