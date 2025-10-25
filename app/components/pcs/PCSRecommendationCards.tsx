"use client";

import { useEffect, useState } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Icon from "@/app/components/ui/Icon";
import { generateStaticRecommendations, type Recommendation } from "@/lib/pcs/recommendation-engine";

interface PCSRecommendationCardsProps {
  claimData: {
    estimated_weight?: number;
    distance_miles?: number;
    rank?: string;
    has_dependents?: boolean;
    departure_date?: string;
    arrival_date?: string;
    origin_base?: string;
    destination_base?: string;
    move_type?: 'dity' | 'full' | 'partial';
    documents_uploaded?: {
      orders?: boolean;
      weigh_ticket?: boolean;
      lodging_receipts?: boolean;
      fuel_receipts?: boolean;
    };
  };
  onRecommendationClick?: (recommendation: Recommendation) => void;
}

export default function PCSRecommendationCards({ 
  claimData, 
  onRecommendationClick 
}: PCSRecommendationCardsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const recs = generateStaticRecommendations(claimData);
    setRecommendations(recs);
  }, [claimData]);

  if (recommendations.length === 0) {
    return null;
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'neutral';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dity_opportunity': return 'DollarSign';
      case 'weight_warning': return 'Scale';
      case 'receipt_reminder': return 'Receipt';
      case 'timeline_warning': return 'Clock';
      case 'document_missing': return 'FileWarning';
      case 'cost_savings': return 'TrendingUp';
      case 'entitlement_tip': return 'Info';
      case 'compliance_risk': return 'AlertTriangle';
      default: return 'Bell';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
        <Badge variant="primary">{recommendations.length} Tips</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((rec) => {
          const isExpanded = expandedIds.has(rec.id);
          
          return (
            <AnimatedCard 
              key={rec.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => toggleExpanded(rec.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  rec.priority === 'high' ? 'bg-red-50' : 
                  rec.priority === 'medium' ? 'bg-yellow-50' : 
                  'bg-gray-50'
                }`}>
                  <Icon 
                    name={getTypeIcon(rec.type)} 
                    className={`h-5 w-5 ${
                      rec.priority === 'high' ? 'text-red-600' : 
                      rec.priority === 'medium' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`} 
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <Badge variant={getPriorityColor(rec.priority) as any}>
                      {rec.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600">
                    {isExpanded ? rec.message : `${rec.message.substring(0, 100)}...`}
                  </p>

                  {rec.estimatedSavings && (
                    <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                      <Icon name="TrendingUp" className="h-4 w-4" />
                      <span>Potential Savings: ${rec.estimatedSavings.toLocaleString()}</span>
                    </div>
                  )}

                  {rec.action && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRecommendationClick) {
                            onRecommendationClick(rec);
                          }
                        }}
                      >
                        <Icon name="ArrowRight" className="h-3 w-3 mr-1" />
                        {rec.action}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      <div className="text-sm text-gray-600 text-center pt-2">
        <Icon name="Sparkles" className="inline h-4 w-4 mr-1" />
        Recommendations are based on JTR regulations and best practices
      </div>
    </div>
  );
}
