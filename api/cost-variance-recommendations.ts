import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { CostVarianceAnomaly } from "@/types/api";

/**
 * This part of the code generates world-class AI recommendations for cost variance anomalies
 * Uses advanced prompts to provide specific, actionable cost reduction strategies
 */
async function generateCostVarianceRecommendations(
  anomaly: CostVarianceAnomaly,
  contextData: { 
    totalAnomalies: number; 
    avgVariance: number; 
    totalImpact: number;
    supplierCount: number;
    warehouseCount: number;
  }
): Promise<string[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('🤖 OpenAI API key not available, using fallback cost recommendations');
    return [
      'Review supplier contracts and negotiate volume discounts',
      'Implement cost monitoring alerts for future variances',
      'Establish approval workflows for non-standard pricing',
      'Conduct supplier performance audit and optimization review'
    ];
  }

  // This part of the code creates world-class prompts specific to each cost variance type
  const prompts = {
    'Cost Spike': `COST SPIKE ANALYSIS & MITIGATION:

Current Situation:
- Supplier: ${anomaly.supplier}
- Cost Variance: +${anomaly.variance}% ($${anomaly.currentValue} vs expected $${anomaly.expectedValue})
- Financial Impact: $${anomaly.financialImpact.toLocaleString()}
- Risk Factors: ${anomaly.riskFactors.join(', ')}
- Severity: ${anomaly.severity}

Context:
- Total cost anomalies detected: ${contextData.totalAnomalies}
- Network-wide variance average: ${contextData.avgVariance}%
- Total impact across operations: $${contextData.totalImpact.toLocaleString()}

Generate 3-4 specific, immediately actionable cost reduction strategies. Focus on:
1. Immediate cost containment actions
2. Supplier negotiation tactics  
3. Process improvements to prevent recurrence
4. Alternative sourcing strategies

Requirements:
- Each recommendation must be implementable within 30 days
- Include specific cost-saving potential when possible
- Focus on measurable outcomes
- No generic advice - be specific to this cost spike scenario`,

    'Quantity Discrepancy': `QUANTITY DISCREPANCY COST CONTROL:

Warehouse Issue:
- Location: ${anomaly.warehouseId}
- Discrepancy Rate: ${anomaly.currentValue}% (expected: ${anomaly.expectedValue}%)
- Financial Impact: $${anomaly.financialImpact.toLocaleString()}
- Processing Issues: ${anomaly.riskFactors.join(', ')}

Operations Context:
- Multiple warehouses affected: ${contextData.warehouseCount}
- Supply chain variance: ${contextData.avgVariance}%
- Total operational impact: $${contextData.totalImpact.toLocaleString()}

Generate 3-4 operational excellence recommendations focusing on:
1. Immediate process controls to reduce discrepancies
2. Technology solutions for accuracy improvement
3. Training and accountability measures
4. Cost recovery and prevention strategies

Requirements:
- Actionable within 2 weeks for maximum impact
- Include ROI potential for each recommendation
- Address both immediate fixes and long-term prevention
- Specific to warehouse operations and inventory accuracy`,

    'Supplier Variance': `SUPPLIER COST VARIANCE OPTIMIZATION:

Supplier Performance Issue:
- Supplier: ${anomaly.supplier}
- Cost Deviation: ${anomaly.variance}% above baseline
- Expected Cost: $${anomaly.expectedValue} | Actual: $${anomaly.currentValue}
- Financial Impact: $${anomaly.financialImpact.toLocaleString()}

Supply Chain Context:
- Active suppliers in network: ${contextData.supplierCount}
- Average cost variance: ${contextData.avgVariance}%
- Total supplier-related cost impact: $${contextData.totalImpact.toLocaleString()}

Generate 3-4 strategic supplier management recommendations:
1. Contract renegotiation strategies with specific terms
2. Alternative supplier evaluation and onboarding
3. Performance-based pricing mechanisms
4. Supply chain diversification tactics

Requirements:
- Focus on sustainable cost reduction (6+ month impact)
- Include specific negotiation leverage points
- Address supplier relationship management
- Provide implementation timeline and expected savings`
  };

  try {
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a world-class supply chain cost optimization expert with 20+ years of experience in 3PL operations. Provide specific, actionable recommendations that drive measurable cost savings. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points - just the actionable steps."
          },
          {
            role: "user", 
            content: prompts[anomaly.type as keyof typeof prompts] || prompts['Cost Spike']
          }
        ],
        max_tokens: 500,
        temperature: 0.2  // Lower temperature for more focused, practical recommendations
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // This part of the code parses AI response into clean, actionable cost recommendations
    const lines = aiResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove any formatting characters and numbers
        return line
          .replace(/^\d+\.\s*/, '')    // Remove "1. "
          .replace(/^[•-]\s*/, '')     // Remove "• " or "- "
          .replace(/^\*+/, '')         // Remove asterisks
          .replace(/\*+$/, '')         // Remove trailing asterisks
          .replace(/\*\*/g, '')        // Remove **bold** formatting
          .replace(/^\s*-\s*/, '')     // Remove leading dashes
          .trim();
      })
      .filter(line => line.length > 10 && line.length < 150)  // Reasonable length for cost actions
      .slice(0, 4);  // Max 4 recommendations

    const recommendations = lines.length > 0 ? lines : [
      'Negotiate emergency pricing review with supplier within 48 hours',
      'Implement cost variance alert system at 20% threshold',
      'Establish backup supplier relationships for critical SKUs',
      'Review and update standard cost baselines monthly'
    ];

    return recommendations;

  } catch (error) {
    console.error('❌ Cost variance AI recommendation generation failed:', error);
    
    // This part of the code provides high-quality fallback recommendations based on anomaly type
    const fallbackRecs = {
      'Cost Spike': [
        'Contact supplier immediately to understand pricing justification',
        'Negotiate temporary price freeze while investigating cost drivers',
        'Identify alternative suppliers for price comparison analysis',
        'Implement expedited approval process for high-variance orders'
      ],
      'Quantity Discrepancy': [
        'Implement double-verification process for receiving operations',
        'Install automated counting technology for high-value shipments',
        'Create daily discrepancy reporting dashboard for managers',
        'Establish supplier charge-back process for quantity variances'
      ],
      'Supplier Variance': [
        'Schedule quarterly business review with supplier executives',
        'Benchmark supplier pricing against market alternatives',
        'Implement performance-based pricing incentive structure',
        'Develop supplier diversification strategy for cost leverage'
      ]
    };

    return fallbackRecs[anomaly.type as keyof typeof fallbackRecs] || fallbackRecs['Cost Spike'];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    console.log("💰 Cost Variance Recommendations API: Processing AI generation request...");
    
    const { anomaly, contextData } = req.body;
    
    if (!anomaly || !contextData) {
      return res.status(400).json({
        success: false,
        error: "Anomaly and context data are required",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`🎯 Generating cost recommendations for: ${anomaly.type} - ${anomaly.title}`);
    console.log(`📊 Context: ${contextData.totalAnomalies} anomalies, $${contextData.totalImpact} total impact`);
    
    // Generate AI-powered cost variance recommendations
    const recommendations = await generateCostVarianceRecommendations(anomaly, contextData);
    
    console.log(`✅ Generated ${recommendations.length} cost optimization recommendations successfully`);
    
    res.status(200).json({
      success: true,
      data: {
        recommendations,
        anomaly: anomaly.title,
        generatedAt: new Date().toISOString(),
        context: {
          type: anomaly.type,
          severity: anomaly.severity,
          financialImpact: anomaly.financialImpact
        }
      },
      message: "Cost variance recommendations generated successfully"
    });

  } catch (error) {
    console.error("❌ Cost Variance Recommendations API Error:", error);
    
    res.status(500).json({
      success: false,
      error: "Failed to generate cost variance recommendations",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
