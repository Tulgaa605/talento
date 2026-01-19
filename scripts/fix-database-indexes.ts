import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function fixDatabaseIndexes() {
  try {
    // Try to load .env file manually
    let databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      try {
        const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
        const match = envFile.match(/DATABASE_URL=(.+)/);
        if (match) {
          databaseUrl = match[1].trim().replace(/^["']|["']$/g, '');
        }
      } catch (e) {
        // .env file not found, try .env.local
        try {
          const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
          const match = envFile.match(/DATABASE_URL=(.+)/);
          if (match) {
            databaseUrl = match[1].trim().replace(/^["']|["']$/g, '');
          }
        } catch (e2) {
          // Ignore
        }
      }
    }
    
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable is not set');
      console.error('Please set DATABASE_URL in .env file or as environment variable');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(databaseUrl);
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Failed to get database connection');
    }

    console.log('\n=== Checking and fixing indexes ===\n');

    // Fix Department indexes
    console.log('1. Checking Department collection indexes...');
    const deptIndexes = await db.collection('Department').indexes();
    console.log('   Current indexes:', deptIndexes.map((i: any) => i.name));
    
    const deptCodeIndex = deptIndexes.find((i: any) => 
      i.name === 'code_1' || 
      (i.key && i.key.code === 1 && Object.keys(i.key).length === 1)
    );
    
    if (deptCodeIndex && deptCodeIndex.name) {
      console.log('   ⚠️  Found old unique index on code field:', deptCodeIndex.name);
      try {
        await db.collection('Department').dropIndex(deptCodeIndex.name);
        console.log('   ✅ Removed old index:', deptCodeIndex.name);
      } catch (error: any) {
        console.log('   ⚠️  Could not remove index (might not exist):', error.message);
      }
    } else {
      console.log('   ✅ No old code index found');
    }

    // Fix Employee indexes
    console.log('\n2. Checking Employee collection indexes...');
    const empIndexes = await db.collection('Employee').indexes();
    console.log('   Current indexes:', empIndexes.map((i: any) => i.name));
    
    const empEmployeeIdIndex = empIndexes.find((i: any) => 
      i.name === 'employeeId_1' || 
      (i.key && i.key.employeeId === 1 && Object.keys(i.key).length === 1)
    );
    
    if (empEmployeeIdIndex && empEmployeeIdIndex.name) {
      console.log('   ⚠️  Found old unique index on employeeId field:', empEmployeeIdIndex.name);
      try {
        await db.collection('Employee').dropIndex(empEmployeeIdIndex.name);
        console.log('   ✅ Removed old index:', empEmployeeIdIndex.name);
      } catch (error: any) {
        console.log('   ⚠️  Could not remove index (might not exist):', error.message);
      }
    } else {
      console.log('   ✅ No old employeeId index found');
    }

    // Fix Position indexes
    console.log('\n3. Checking Position collection indexes...');
    const posIndexes = await db.collection('Position').indexes();
    console.log('   Current indexes:', posIndexes.map((i: any) => i.name));
    
    const posCodeIndex = posIndexes.find((i: any) => 
      i.name === 'code_1' || 
      (i.key && i.key.code === 1 && Object.keys(i.key).length === 1)
    );
    
    if (posCodeIndex && posCodeIndex.name) {
      console.log('   ⚠️  Found old unique index on code field:', posCodeIndex.name);
      try {
        await db.collection('Position').dropIndex(posCodeIndex.name);
        console.log('   ✅ Removed old index:', posCodeIndex.name);
      } catch (error: any) {
        console.log('   ⚠️  Could not remove index (might not exist):', error.message);
      }
    } else {
      console.log('   ✅ No old code index found');
    }

    // Create composite unique indexes if they don't exist
    console.log('\n4. Creating composite unique indexes...');
    
    try {
      // Department: code + companyId
      await db.collection('Department').createIndex(
        { code: 1, companyId: 1 },
        { unique: true, name: 'code_companyId_unique' }
      );
      console.log('   ✅ Created Department code_companyId unique index');
    } catch (error: any) {
      if (error.code === 85 || error.message?.includes('already exists')) {
        console.log('   ℹ️  Department code_companyId index already exists');
      } else {
        console.log('   ⚠️  Could not create Department index:', error.message);
      }
    }

    try {
      // Employee: employeeId + companyId
      await db.collection('Employee').createIndex(
        { employeeId: 1, companyId: 1 },
        { unique: true, name: 'employeeId_companyId_unique' }
      );
      console.log('   ✅ Created Employee employeeId_companyId unique index');
    } catch (error: any) {
      if (error.code === 85 || error.message?.includes('already exists')) {
        console.log('   ℹ️  Employee employeeId_companyId index already exists');
      } else {
        console.log('   ⚠️  Could not create Employee index:', error.message);
      }
    }

    try {
      // Position: code + companyId (should already exist from schema)
      await db.collection('Position').createIndex(
        { code: 1, companyId: 1 },
        { unique: true, name: 'code_companyId_unique' }
      );
      console.log('   ✅ Created Position code_companyId unique index');
    } catch (error: any) {
      if (error.code === 85 || error.message?.includes('already exists')) {
        console.log('   ℹ️  Position code_companyId index already exists');
      } else {
        console.log('   ⚠️  Could not create Position index:', error.message);
      }
    }

    console.log('\n=== Index fix completed ===\n');
    console.log('✅ Please restart your application for changes to take effect');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('Error fixing indexes:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixDatabaseIndexes();

