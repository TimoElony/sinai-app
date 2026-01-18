#!/usr/bin/env node

/**
 * Script to fetch the current route count for each area and update the database.
 * Run with: node scripts/update-route-counts.mjs
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAreasList() {
  console.log('📍 Fetching areas list...');
  const response = await fetch('http://localhost:5173/api/climbingareas');
  if (!response.ok) {
    throw new Error(`Failed to fetch areas: ${response.status}`);
  }
  return response.json();
}

async function getRouteCountForArea(areaName) {
  try {
    const response = await fetch(`http://localhost:5173/api/climbingroutes/${encodeURIComponent(areaName)}`);
    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch routes for ${areaName}: ${response.status}`);
      return null;
    }
    const routes = await response.json();
    return Array.isArray(routes) ? routes.length : 0;
  } catch (err) {
    console.warn(`⚠️  Error fetching routes for ${areaName}:`, err.message);
    return null;
  }
}

async function updateAreaRouteCount(areaName, newCount) {
  const { error } = await supabase
    .from('climbing_areas')
    .update({ route_count: newCount })
    .eq('name', areaName);

  if (error) {
    console.error(`  ❌ Failed to update ${areaName}:`, error.message);
    return false;
  }
  console.log(`  ✅ Updated ${areaName}: ${newCount} routes`);
  return true;
}

async function main() {
  try {
    console.log('🚀 Starting route count update...\n');

    const areas = await getAreasList();
    console.log(`Found ${areas.length} areas.\n`);

    let updated = 0;
    let skipped = 0;

    for (const area of areas) {
      process.stdout.write(`📦 Processing ${area.name}... `);
      const routeCount = await getRouteCountForArea(area.name);

      if (routeCount === null) {
        console.log('⏭️  skipped');
        skipped++;
        continue;
      }

      const success = await updateAreaRouteCount(area.name, routeCount);
      if (success) {
        updated++;
      }
    }

    console.log(`\n✨ Complete: ${updated} areas updated, ${skipped} skipped.`);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
