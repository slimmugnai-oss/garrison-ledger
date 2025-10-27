"use client";

import Card, { CardContent } from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";

interface PCSHelpAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  answer: {
    bottomLine?: string[];
    nextSteps?: { text: string; action: string; url?: string }[];
    numbersUsed?: { value: string; source: string; effective_date: string }[];
    citations?: { title: string; url: string }[];
    verificationChecklist?: string[];
    confidence?: number;
    mode?: "strict" | "advisory";
  } | null;
  question: string;
}

export default function PCSHelpAnswerModal({
  isOpen,
  onClose,
  answer,
  question,
}: PCSHelpAnswerModalProps) {
  if (!isOpen || !answer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Icon name="MessageCircle" className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Answer</h3>
                {answer.confidence !== undefined && (
                  <Badge variant={answer.confidence > 0.7 ? "success" : "warning"}>
                    {Math.round(answer.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">{question}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 transition-colors hover:text-gray-600"
            >
              <Icon name="X" className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bottom Line */}
          {answer.bottomLine && answer.bottomLine.length > 0 && (
            <div className="mb-6">
              <div className="space-y-3">
                {answer.bottomLine.map((line, index) => (
                  <p
                    key={index}
                    className={`${index === 0 ? "text-lg font-semibold text-slate-900" : "text-base text-slate-700"}`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {answer.nextSteps && answer.nextSteps.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <Icon name="CheckCircle" className="h-5 w-5 text-blue-600" />
                  Next Steps
                </h4>
                <div className="space-y-2">
                  {answer.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{step.text}</p>
                        {step.url && (
                          <a
                            href={step.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            {step.action} <Icon name="ExternalLink" className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Numbers Used */}
          {answer.numbersUsed && answer.numbersUsed.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                  Official Rates Used
                </h4>
                <div className="space-y-2">
                  {answer.numbersUsed.map((num, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{num.value}</p>
                        <p className="text-xs text-slate-600">{num.source}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        Effective: {new Date(num.effective_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Citations */}
          {answer.citations && answer.citations.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <Icon name="BookOpen" className="h-5 w-5 text-purple-600" />
                  Sources
                </h4>
                <div className="space-y-2">
                  {answer.citations.map((citation, index) => (
                    <a
                      key={index}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <Icon name="ExternalLink" className="h-4 w-4 flex-shrink-0" />
                      <span>{citation.title}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Checklist */}
          {answer.verificationChecklist && answer.verificationChecklist.length > 0 && (
            <Card className="bg-yellow-50">
              <CardContent className="p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-yellow-900">
                  <Icon name="Shield" className="h-5 w-5 text-yellow-600" />
                  How to Verify This Information
                </h4>
                <ul className="space-y-2">
                  {answer.verificationChecklist.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-yellow-900">
                      <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Powered by Ask Military Expert •{" "}
              {answer.mode === "strict" ? "Official Data Sources" : "Expert Guidance"}
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
