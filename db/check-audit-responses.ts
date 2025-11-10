import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const auditId = process.argv[2] || '6'; // Default to test audit ID

(async () => {
  console.log('🔍 Checking responses for audit:', auditId.substring(0, 20) + '...\n');
  
  try {
    // Check audit status (UUID needs proper casting)
    const audit = await sql`
      SELECT id, status, submitted_at
      FROM audits
      WHERE id::text = ${auditId}
    `;
    
    if (audit.rows.length === 0) {
      console.log('❌ Audit not found');
      process.exit(0);
    }
    
    console.log('📋 Audit Status:', audit.rows[0].status);
    console.log('   Submitted at:', audit.rows[0].submitted_at || 'Not submitted');
    
    // Check responses in DB (UUID needs proper casting)
    const responses = await sql`
      SELECT question_id, answer_value
      FROM form_responses
      WHERE audit_id::text = ${auditId}
      ORDER BY question_id
    `;
    
    console.log('\n📊 Responses in DATABASE:', responses.rows.length);
    
    if (responses.rows.length === 0) {
      console.log('   ✅ NO responses saved yet - This is CORRECT before submit!');
    } else {
      console.log('   Responses found:');
      responses.rows.slice(0, 5).forEach(r => {
        console.log(`      Q${r.question_id}: ${r.answer_value}`);
      });
      if (responses.rows.length > 5) {
        console.log('      ... and', responses.rows.length - 5, 'more');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

