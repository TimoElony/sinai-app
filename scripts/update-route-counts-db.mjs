#!/usr/bin/env node

/**
 * Script to fetch the current route count for each area and update the database.
 * This version uses direct database queries and can run standalone.
 * Run with: node scripts/update-route-counts-db.mjs
 */

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
  const { data, error } = await supabase
    .from('climbing_areas')
    .select('id, name, route_count');

  if (error) {
    throw new Error(`Failed to fetch areas: ${error.message}`);
  }
  return data || [];
}

async function getRouteCountForArea(areaName) {
  try {
    // Count all routes that belong to this area
    const { count, error } = await supabase
      .from('climbing_routes')
      .select('*', { count: 'exact', head: true })
      .eq('climbing_area_name', areaName);

    if (error) {
      console.warn(`⚠️  Error counting routes for ${areaName}:`, error.message);
      return null;
    }
    return count || 0;
  } catch (err) {
    console.warn(`⚠️  Error fetching routes for ${areaName}:`, err.message);
    return null;
  }
}

async function updateAreaRouteCount(areaId, areaName, newCount, oldCount) {
  const { error } = await supabase
    .from('climbing_areas')
    .update({ route_count: newCount })
    .eq('id', areaId);

  if (error) {
    console.error(`  ❌ Failed to update ${areaName}:`, error.message);
    return false;
  }

  const change = newCount - oldCount;
  const changeStr = change > 0 ? `+${change}` : `${change}`;
  console.log(`  ✅ Updated ${areaName}: ${oldCount} → ${newCount} routes (${changeStr})`);
  return true;
}

async function main() {
  try {
    console.log('🚀 Starting route count update...\n');

    const areas = await getAreasList();
    console.log(`Found ${areas.length} areas.\n`);

    let updated = 0;
    let skipped = 0;
    let noChange = 0;

    for (const area of areas) {
      process.stdout.write(`📦 ${area.name.padEnd(30)}... `);
      const routeCount = await getRouteCountForArea(area.name);

      if (routeCount === null) {
        console.log('⏭️  skipped');
        skipped++;
        continue;
      }

      if (routeCount === area.route_count) {
        console.log(`✓ no change (${routeCount})`);
        noChange++;
        continue;
      }

      const success = await updateAreaRouteCount(area.id, area.name, routeCount, area.route_count || 0);
      if (success) {
        updated++;
      }
    }

    console.log(`\n✨ Complete:`);
    console.log(`  ✅ ${updated} areas updated`);
    console.log(`  ✓ ${noChange} areas unchanged`);
    console.log(`  ⏭️  ${skipped} areas skipped`);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
