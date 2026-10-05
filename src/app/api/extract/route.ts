import { NextResponse } from 'next/server';

/**
 * Risk Mitigation for Medical Device Software (SaMD / MDR 2017/745):
 * Uncontrolled free-text LLM extraction directly in clinical decision paths
 * has been decommissioned to eliminate hallucination risks.
 * 
 * All clinical staging and prescription selections must originate strictly
 * from deterministic, rule-based clinical decision matrices grounded in
 * peer-reviewed oncology guidelines (NCCN, ASTRO, ESTRO, QUANTEC).
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Uncontrolled free-text extraction in primary clinical decision flows has been decommissioned in compliance with SaMD / MDR Rule 11 medical device safety requirements. All recommendations must be evaluated deterministically through verified clinical decision matrices.',
      decommissioned: true,
      standard: 'EU MDR 2017/745 Rule 11 / SaMD Class IIa Risk Mitigation',
    },
    { status: 410 }, // 410 Gone
  );
}

export async function GET() {
  return NextResponse.json(
    {
      status: 'decommissioned',
      reason: 'MDR / SaMD safety compliance: Primary clinical decision pathways must be strictly deterministic and audit-traceable.',
    },
    { status: 410 },
  );
}